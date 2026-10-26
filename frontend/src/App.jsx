import { useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Activity, ArrowDownRight, ArrowUpRight, BookOpen, Check, ChevronRight, CirclePlus, ClipboardList, GraduationCap, LayoutDashboard, LoaderCircle, MessageSquareText, Pencil, Plus, Search, Send, ShieldCheck, Sparkles, Star, Trash2, X } from 'lucide-react';
import { createFeedback, deleteFeedback, getFeedback, updateFeedback } from './api';

const blank = { courseName: '', courseDuration: '', comments: '', rating: 5 };
const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join('');

function Stars({ value, large = false }) {
  return <span className={`stars ${large ? 'stars-large' : ''}`} aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map(n => <Star key={n} size={large ? 19 : 14} fill={n <= Math.round(value) ? 'currentColor' : 'none'} strokeWidth={1.8} />)}
  </span>;
}

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(blank);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try { setItems(await getFeedback()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const courseRows = useMemo(() => {
    const grouped = new Map();
    items.forEach(item => {
      const key = item.courseName.trim().toLowerCase();
      if (!grouped.has(key)) grouped.set(key, { key, courseName: item.courseName, courseDuration: item.courseDuration, entries: [], ratings: 0 });
      const row = grouped.get(key);
      row.entries.push(item);
      row.ratings += Number(item.rating);
      if (item.courseDuration) row.courseDuration = item.courseDuration;
    });
    return [...grouped.values()].map((row, index) => ({
      ...row,
      courseId: `CRS-${String(index + 1).padStart(3, '0')}`,
      average: row.ratings / row.entries.length,
      latest: row.entries[0]
    })).filter(row => `${row.courseName} ${row.courseId}`.toLowerCase().includes(query.toLowerCase()));
  }, [items, query]);

  const avgRating = items.length ? items.reduce((sum, item) => sum + Number(item.rating), 0) / items.length : 0;
  const uniqueCourses = new Set(items.map(item => item.courseName.trim().toLowerCase())).size;

  function startAdd() {
    setEditing(null); setForm(blank); setNotice(''); setError('');
    navigate('/feedback/new');
  }
  function startEdit(item) {
    setEditing(item._id);
    setForm({ courseName: item.courseName, courseDuration: item.courseDuration, comments: item.comments, rating: item.rating });
    setNotice(''); setError('');
    navigate('/feedback/new');
  }
  async function submitFeedback(event) {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      if (editing) await updateFeedback(editing, form);
      else await createFeedback(form);
      await refresh();
      setNotice(editing ? 'Your changes have been saved.' : 'Feedback added successfully.');
      setEditing(null); setForm(blank); navigate('/');
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }
  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteFeedback(deleteTarget._id);
      setItems(current => current.filter(item => item._id !== deleteTarget._id));
      setNotice('Feedback entry deleted.');
    } catch (e) { setError(e.message); }
    setDeleteTarget(null);
  }

  const isForm = location.pathname.startsWith('/feedback/new');

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Activity size={22} strokeWidth={2.6} /></div><div><span className="brand-name">feedback<span>flow</span></span><span className="brand-caption">ADMIN CONSOLE</span></div></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="side-nav">
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><LayoutDashboard size={18}/><span>Dashboard</span><ChevronRight className="nav-chevron" size={15}/></NavLink>
        <NavLink to="/feedback/new" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => { setEditing(null); setForm(blank); }}><CirclePlus size={18}/><span>Add Feedback</span><ChevronRight className="nav-chevron" size={15}/></NavLink>
      </nav>
      <div className="sidebar-bottom"><div className="secure-icon"><ShieldCheck size={18}/></div><div><strong>All feedback, one place.</strong><p>Keep learning experiences moving forward.</p></div></div>
      <div className="sidebar-foot"><span className="status-dot"/> System operational <span className="version">v1.0</span></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="crumb"><span>Workspace</span><ChevronRight size={14}/><strong>{isForm ? (editing ? 'Edit feedback' : 'Add feedback') : 'Dashboard'}</strong></div><div className="top-actions"><span className="admin-pill"><span className="admin-avatar">A</span><span>Administrator</span></span></div></header>
      <div className="page-wrap">
        {notice && <div className="notice"><Check size={17}/>{notice}<button onClick={() => setNotice('')} aria-label="Dismiss message"><X size={16}/></button></div>}
        {error && <div className="error-banner"><span>{error}</span><button onClick={() => { setError(''); refresh(); }}>Try again</button></div>}
        <Routes>
          <Route path="/" element={<>
            <section className="welcome-row"><div><div className="eyebrow"><Sparkles size={14}/> FEEDBACK OVERVIEW</div><h1>Good morning, Admin<span className="title-dot">.</span></h1><p className="subheading">A clear view of how your courses are landing with learners.</p></div><button className="primary-btn" onClick={startAdd}><Plus size={18}/> Add feedback</button></section>
            <section className="stats-grid">
              <StatCard icon={<MessageSquareText size={19}/>} label="Total responses" value={items.length} note="All submitted feedback" tone="violet" trend={<ClipboardList size={15}/>}/>
              <StatCard icon={<BookOpen size={19}/>} label="Courses reviewed" value={uniqueCourses} note="Unique course names" tone="blue" trend={<GraduationCap size={15}/>}/>
              <StatCard icon={<Star size={19}/>} label="Average rating" value={items.length ? avgRating.toFixed(1) : '—'} suffix={items.length ? '/ 5' : ''} note="Across all responses" tone="amber" trend={<ArrowUpRight size={15}/>}/>
            </section>
            <section className="panel">
              <div className="panel-heading"><div><h2>Course feedback</h2><p>Review ratings and manage submitted responses.</p></div><div className="count-pill">{courseRows.length} {courseRows.length === 1 ? 'course' : 'courses'}</div></div>
              <div className="table-tools"><div className="searchbox"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search courses..." aria-label="Search courses"/></div><span className="updated-label"><span className="status-dot"/> Live data</span></div>
              {loading ? <div className="loading-state"><LoaderCircle className="spin" size={25}/><span>Loading feedback…</span></div> : courseRows.length === 0 ? <div className="empty-state"><div className="empty-icon"><ClipboardList size={25}/></div><h3>{query ? 'No matching courses' : 'Your feedback space is ready'}</h3><p>{query ? 'Try another course name or clear the search.' : 'Add the first feedback response to see course ratings and summaries here.'}</p>{!query && <button className="primary-btn" onClick={startAdd}><Plus size={17}/> Add first feedback</button>}</div> : <div className="table-scroll"><table><thead><tr><th>COURSE ID</th><th>COURSE NAME</th><th>DURATION</th><th>OVERALL RATING</th><th>RESPONSES</th><th className="actions-head">ACTIONS</th></tr></thead><tbody>
                {courseRows.map(row => <tr key={row.key}><td><span className="course-id">{row.courseId}</span></td><td><div className="course-cell"><div className="course-avatar">{initials(row.courseName)}</div><div><strong>{row.courseName}</strong><span>Course feedback</span></div></div></td><td><span className="duration">{row.courseDuration}</span></td><td><div className="rating-cell"><div className="rating-number">{row.average.toFixed(1)}</div><div><Stars value={row.average}/><span className="rating-caption">out of 5</span></div></div></td><td><span className="response-count">{row.entries.length} {row.entries.length === 1 ? 'response' : 'responses'}</span></td><td><div className="action-buttons"><button className="icon-btn edit-btn" title="Edit latest feedback" aria-label={`Edit feedback for ${row.courseName}`} onClick={() => startEdit(row.latest)}><Pencil size={16}/></button><button className="icon-btn delete-btn" title="Delete latest feedback" aria-label={`Delete feedback for ${row.courseName}`} onClick={() => setDeleteTarget(row.latest)}><Trash2 size={16}/></button></div></td></tr>)}
              </tbody></table></div>}
              <div className="panel-footer"><span>Ratings are averaged across each course's responses.</span><span>Updated automatically <ArrowDownRight size={14}/></span></div>
            </section>
            <div className="bottom-note"><div className="note-symbol"><Activity size={17}/></div><p><strong>Small feedback makes a big difference.</strong> Use learner comments to spot what works and what needs attention.</p></div>
          </>} />
          <Route path="/feedback/new" element={<section className="form-page">
            <div className="welcome-row form-welcome"><div><div className="eyebrow"><MessageSquareText size={14}/> FEEDBACK MANAGEMENT</div><h1>{editing ? 'Refine feedback' : 'Add feedback'}<span className="title-dot">.</span></h1><p className="subheading">{editing ? 'Update the submitted response and keep the record accurate.' : 'Capture a learner’s experience and help improve every course.'}</p></div><button className="secondary-btn" onClick={() => { setEditing(null); setForm(blank); navigate('/'); }}><X size={16}/> Cancel</button></div>
            <div className="form-layout"><div className="form-panel"><div className="form-panel-title"><div className="form-title-icon"><ClipboardList size={20}/></div><div><h2>{editing ? 'Edit response details' : 'Response details'}</h2><p>Fields marked with * are required.</p></div></div>
              <form onSubmit={submitFeedback} className="feedback-form">
                <div className="field"><label htmlFor="courseName">Course name <span>*</span></label><input id="courseName" value={form.courseName} onChange={e => setForm({...form, courseName:e.target.value})} placeholder="e.g. Introduction to Data Science" maxLength={120} required/><small>Use the course’s full name.</small></div>
                <div className="field"><label htmlFor="courseDuration">Course duration <span>*</span></label><input id="courseDuration" value={form.courseDuration} onChange={e => setForm({...form, courseDuration:e.target.value})} placeholder="e.g. 8 weeks or 24 hours" maxLength={60} required/><small>Shown alongside the course on your dashboard.</small></div>
                <div className="field"><label>Feedback rating <span>*</span></label><div className="rating-picker" role="radiogroup" aria-label="Feedback rating">{[1,2,3,4,5].map(n => <button type="button" key={n} className={`rating-option ${Number(form.rating) >= n ? 'chosen' : ''} ${Number(form.rating) === n ? 'selected' : ''}`} onClick={() => setForm({...form, rating:n})} role="radio" aria-checked={Number(form.rating)===n} aria-label={`${n} star${n>1?'s':''}`}><Star size={24} fill={Number(form.rating)>=n?'currentColor':'none'}/></button>)}<span className="rating-description">{['Needs improvement','Below expectations','Meets expectations','Very good','Excellent'][Number(form.rating)-1]}</span></div></div>
                <div className="field"><label htmlFor="comments">Feedback comments <span>*</span></label><textarea id="comments" value={form.comments} onChange={e => setForm({...form, comments:e.target.value})} placeholder="What did the learner enjoy? What could be improved?" rows={5} maxLength={2000} required/><div className="field-foot"><small>Be specific and constructive.</small><small>{form.comments.length}/2000</small></div></div>
                <div className="form-actions"><button type="button" className="secondary-btn" onClick={() => {setEditing(null);setForm(blank);navigate('/');}}>Cancel</button><button className="primary-btn" type="submit" disabled={saving}>{saving ? <LoaderCircle className="spin" size={17}/> : <Send size={16}/>} {saving ? 'Saving…' : editing ? 'Save changes' : 'Submit feedback'}</button></div>
              </form>
            </div><aside className="form-aside"><div className="preview-card"><div className="preview-top"><div className="preview-icon"><GraduationCap size={21}/></div><span className="preview-tag">LIVE PREVIEW</span></div><span className="preview-label">COURSE</span><h3>{form.courseName || 'Your course name'}</h3><div className="preview-duration"><BookOpen size={15}/>{form.courseDuration || 'Course duration'}</div><div className="preview-divider"/><span className="preview-label">RATING</span><div className="preview-rating"><strong>{Number(form.rating).toFixed(1)}</strong><Stars value={Number(form.rating)} large/></div><p className="preview-comment">{form.comments ? `“${form.comments}”` : 'Your feedback comments will appear in this preview as you type.'}</p><div className="preview-by"><div className="preview-person">L</div><span>Learner feedback</span></div></div><div className="tip-card"><div className="tip-icon"><Sparkles size={17}/></div><div><strong>A helpful tip</strong><p>Thoughtful feedback pairs a rating with a clear example. It helps course teams make changes that matter.</p></div></div></aside></div>
          </section>} />
          <Route path="*" element={<section className="empty-state"><h3>Page not found</h3><button className="primary-btn" onClick={() => navigate('/')}>Return to dashboard</button></section>} />
        </Routes>
        <footer className="page-footer"><span>FeedbackFlow <span className="footer-dot">·</span> Course insights, made clearer.</span><span>Built for better learning experiences</span></footer>
      </div>
    </main>
    {deleteTarget && <div className="modal-backdrop" role="presentation" onMouseDown={e => {if(e.target===e.currentTarget)setDeleteTarget(null);}}><section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title"><div className="modal-icon"><Trash2 size={22}/></div><h2 id="delete-title">Delete this feedback?</h2><p>This will permanently remove the response for <strong>{deleteTarget.courseName}</strong>. This action cannot be undone.</p><div className="modal-actions"><button className="secondary-btn" onClick={() => setDeleteTarget(null)}>Keep feedback</button><button className="danger-btn" onClick={confirmDelete}><Trash2 size={16}/> Delete response</button></div></section></div>}
  </div>;
}

function StatCard({icon,label,value,suffix='',note,tone,trend}) {
  return <article className="stat-card"><div className="stat-top"><div className={`stat-icon ${tone}`}>{icon}</div><div className={`stat-mini ${tone}`}>{trend}</div></div><div className="stat-label">{label}</div><div className="stat-value">{value}<span>{suffix}</span></div><div className="stat-note">{note}</div></article>;
}

export default App;

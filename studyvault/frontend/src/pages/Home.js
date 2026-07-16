
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import NoteCard from '../components/NoteCard';
import { useAuth } from '../context/AuthContext';

const SUBJECTS = ['All', 'Computer Science', 'Mathematics', 'Physics', 'English', 'Economics', 'Other'];

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('All');
  const [sort, setSort] = useState('recent');
  const { user } = useAuth();

  useEffect(() => { fetchNotes(); }, [subject, sort]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = { sort };
      if (subject !== 'All') params.subject = subject;
      if (search) params.search = search;
      const res = await axios.get('/api/notes', { params });
      setNotes(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div className="hero">
        <div className="hero-badge">✦ Built for University Students</div>
        <h1>Share Notes.<br />Ace Every Exam.</h1>
        <p>Upload your study notes, discover what classmates share, and rate the best resources — all in one place.</p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          {!user ? (
            <>
              <Link to="/register" className="nav-btn" style={{ padding:'12px 28px', fontSize:15 }}>Get Started Free</Link>
              <Link to="/login" style={{ padding:'12px 28px', fontSize:15, borderRadius:10, border:'1px solid rgba(255,255,255,0.15)', color:'#ccc', textDecoration:'none' }}>Login</Link>
            </>
          ) : (
            <Link to="/upload" className="nav-btn" style={{ padding:'12px 28px', fontSize:15 }}>+ Upload Notes</Link>
          )}
        </div>
        <div className="hero-stats">
          <div className="hero-stat"><div className="hero-stat-num">{notes.length}+</div><div className="hero-stat-label">Notes Shared</div></div>
          <div className="hero-stat"><div className="hero-stat-num">5★</div><div className="hero-stat-label">Avg Rating</div></div>
          <div className="hero-stat"><div className="hero-stat-num">Free</div><div className="hero-stat-label">Always</div></div>
        </div>
      </div>

      <div className="container" style={{ paddingTop:0 }}>
        <h2 className="page-title">Browse Notes</h2>
        <div className="filters-bar">
          <form onSubmit={e => { e.preventDefault(); fetchNotes(); }} style={{ display:'flex', gap:8, flex:1 }}>
            <input className="search-input" placeholder="🔍  Search by title, subject or keyword..." value={search} onChange={e => setSearch(e.target.value)} />
            <button type="submit" className="filter-btn active" style={{ borderRadius:12, padding:'8px 20px' }}>Search</button>
          </form>
          <select className="form-select" style={{ width:'auto', padding:'10px 14px', minWidth:160 }} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="recent">Most Recent</option>
            <option value="downloads">Most Downloaded</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
        <div className="filters-bar">
          {SUBJECTS.map(s => (
            <button key={s} className={`filter-btn ${subject===s?'active':''}`} onClick={() => setSubject(s)}>{s}</button>
          ))}
        </div>
        {loading ? (
          <div className="loading">Loading notes</div>
        ) : notes.length === 0 ? (
          <div className="empty-state">
            <p>📚</p>
            <p>No notes found. Be the first to upload!</p>
            {user && <Link to="/upload" className="nav-btn" style={{ display:'inline-block', marginTop:'1.5rem' }}>+ Upload Notes</Link>}
          </div>
        ) : (
          <div className="notes-grid">
            {notes.map(note => <NoteCard key={note._id} note={note} />)}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
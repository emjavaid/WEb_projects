import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import NoteCard from '../components/NoteCard';

const Profile = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyNotes();
  }, []);

  const fetchMyNotes = async () => {
    try {
      // Set token fresh from localStorage
      const token = localStorage.getItem('token');
      if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await axios.get('/api/notes');
      // Filter notes uploaded by current user
      const myNotes = res.data.filter(n => n.uploaderName === user?.name);
      setNotes(myNotes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalDownloads = notes.reduce((sum, n) => sum + (n.downloads || 0), 0);
  const avgRating = notes.length > 0
    ? (notes.reduce((sum, n) => sum + (n.averageRating || 0), 0) / notes.length).toFixed(1)
    : '0.0';

  if (loading) return <div className="loading">Loading profile</div>;

  return (
    <div className="container">
      {/* Profile Header */}
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '2rem',
        marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg, var(--primary), var(--accent), var(--accent2))' }} />
        
        <div style={{
          width: 76, height: 76, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: '#fff', flexShrink: 0
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        <div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', fontWeight:800 }}>{user?.name}</div>
          <div style={{ color:'var(--text-secondary)', fontSize:14, marginTop:3 }}>{user?.rollNumber} · {user?.email}</div>
        </div>

        <div style={{ marginLeft:'auto', display:'flex', gap:'2.5rem', textAlign:'center' }}>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:800, background:'linear-gradient(135deg,var(--primary),var(--accent))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{notes.length}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.5px' }}>Notes Uploaded</div>
          </div>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:800, background:'linear-gradient(135deg,var(--accent3),#3da84a)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{totalDownloads}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.5px' }}>Downloads</div>
          </div>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:800, background:'linear-gradient(135deg,var(--accent2),var(--accent))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{avgRating}★</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.5px' }}>Avg Rating</div>
          </div>
        </div>
      </div>

      <h2 className="page-title">My Uploaded Notes</h2>
      {notes.length === 0 ? (
        <div className="empty-state">
          <p>📝</p>
          <p>You haven't uploaded any notes yet.</p>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map(note => <NoteCard key={note._id} note={note} />)}
        </div>
      )}
    </div>
  );
};

export default Profile;
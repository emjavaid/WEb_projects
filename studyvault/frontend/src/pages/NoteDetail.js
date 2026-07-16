import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const subjectClass = {
  'Computer Science': 'subject-cs', 'Mathematics': 'subject-math',
  'Physics': 'subject-phy', 'English': 'subject-eng',
  'Economics': 'subject-eco', 'Other': 'subject-other',
};

const NoteDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStars, setSelectedStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [comment, setComment] = useState('');
  const [ratingInfo, setRatingInfo] = useState(null);

  // AI States
  const [activeAI, setActiveAI] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => { fetchNote(); }, [id]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const fetchNote = async () => {
    try {
      const res = await axios.get(`/api/notes/${id}`);
      setNote(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  /* ── AI Helpers — all go through backend /api/ai/* ── */
  const handleSummarize = async () => {
    setActiveAI('summary');
    if (summary) return;
    setAiLoading(true);
    try {
      const { data } = await axios.post('/api/ai/summarize', { title: note.title, content: note.content });
      setSummary(data.summary);
    } catch { setSummary('Failed to generate summary. Please try again.'); }
    finally { setAiLoading(false); }
  };

  const handleQuiz = async () => {
    setActiveAI('quiz');
    if (quiz) return;
    setAiLoading(true);
    try {
      const { data } = await axios.post('/api/ai/quiz', { content: note.content });
      setQuiz({ ...data, selected: {}, submitted: false });
    } catch { setQuiz({ error: 'Failed to generate quiz. Please try again.' }); }
    finally { setAiLoading(false); }
  };

  const handleChat = () => {
    setActiveAI('chat');
    if (chatMessages.length === 0) {
      setChatMessages([{ role: 'ai', text: `Hi! I've read "${note.title}". Ask me anything about these notes! 🎓` }]);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiLoading(true);
    try {
      const { data } = await axios.post('/api/ai/chat', { title: note.title, content: note.content, question: userMsg });
      setChatMessages(prev => [...prev, { role: 'ai', text: data.answer }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I could not process that. Try again.' }]);
    } finally { setAiLoading(false); }
  };

  /* ── Non-AI handlers ── */
  const handleRate = async (val) => {
    if (!user) return alert('Please login to rate notes.');
    setSelectedStars(val);
    try {
      const res = await axios.post(`/api/notes/${id}/rate`, { value: val });
      setRatingInfo(res.data);
    } catch (err) { console.error(err); }
  };

  const handleDownload = async () => {
    await axios.post(`/api/notes/${id}/download`);
    const content = `${note.title}\n${'='.repeat(note.title.length)}\n\nSubject: ${note.subject}\nUploaded by: ${note.uploaderName}\nDate: ${new Date(note.createdAt).toLocaleDateString()}\n\n${'-'.repeat(50)}\n\n${note.content}\n\n${'-'.repeat(50)}\nDownloaded from StudyVault`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setNote(prev => ({ ...prev, downloads: prev.downloads + 1 }));
  };

  const handleComment = async () => {
    if (!user) return alert('Please login to comment.');
    if (!comment.trim()) return;
    try {
      const res = await axios.post(`/api/notes/${id}/comment`, { text: comment });
      setNote(prev => ({ ...prev, comments: [...prev.comments, res.data] }));
      setComment('');
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this note? This cannot be undone.')) return;
    try {
      await axios.delete(`/api/notes/${id}`);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete note.');
    }
  };

  if (loading) return <div className="loading">Loading note</div>;
  if (!note) return <div className="loading">Note not found.</div>;

  const isOwner = user && note.uploader && note.uploader._id === user._id;
  const avg = ratingInfo ? ratingInfo.averageRating : (note.averageRating || 0);
  const totalRatings = ratingInfo ? ratingInfo.totalRatings : note.ratings.length;

  const aiTabStyle = (tab) => ({
    padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, transition: 'all .2s',
    background: activeAI === tab
      ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
      : 'var(--surface2)',
    color: activeAI === tab ? '#fff' : 'var(--text-secondary)',
    boxShadow: activeAI === tab ? '0 4px 16px var(--primary-glow)' : 'none',
  });

  return (
    <div className="note-detail-page">
      <Link to="/" className="back-link">← Back to notes</Link>

      {/* Note Content */}
      <div className="note-detail-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <span className={`card-subject ${subjectClass[note.subject] || 'subject-other'}`}>{note.subject}</span>
          {isOwner && (
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => navigate(`/notes/${id}/edit`)}
                style={{
                  padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(108,99,255,0.5)',
                  background: 'var(--surface2)', color: 'var(--primary)', fontFamily: 'var(--font-body)',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                }}
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,107,107,0.5)',
                  background: 'var(--surface2)', color: 'var(--accent)', fontFamily: 'var(--font-body)',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
        <div className="detail-title">{note.title}</div>
        <div className="detail-meta">
          By <strong>{note.uploaderName}</strong> &nbsp;·&nbsp;
          {note.downloads} downloads &nbsp;·&nbsp;
          {totalRatings} ratings &nbsp;·&nbsp;
          {new Date(note.createdAt).toLocaleDateString()}
        </div>
        <div className="detail-content">{note.content}</div>
      </div>

      {/* ── AI FEATURES ── */}
      <div className="note-detail-card" style={{ borderColor: 'rgba(108,99,255,0.3)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1.25rem' }}>
          <span style={{ fontSize:22 }}>🤖</span>
          <div>
            <div className="section-title" style={{ marginBottom:2 }}>AI Study Tools</div>
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>Powered by Claude AI</div>
          </div>
        </div>

        {/* AI Tab Buttons */}
        <div style={{ display:'flex', gap:10, marginBottom:'1.5rem', flexWrap:'wrap' }}>
          <button style={aiTabStyle('summary')} onClick={handleSummarize}>⚡ Summarize</button>
          <button style={aiTabStyle('quiz')} onClick={handleQuiz}>🧠 Generate Quiz</button>
          <button style={aiTabStyle('chat')} onClick={handleChat}>💬 Ask AI</button>
        </div>

        {/* Loading */}
        {aiLoading && (
          <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-secondary)' }}>
            <div style={{ fontSize:32, marginBottom:8, animation:'spin 1.5s linear infinite', display:'inline-block' }}>✨</div>
            <div style={{ fontSize:14 }}>AI is thinking...</div>
          </div>
        )}

        {/* Summary */}
        {!aiLoading && activeAI === 'summary' && summary && (
          <div style={{ background:'var(--bg3)', borderRadius:12, padding:'1.25rem', border:'1px solid rgba(108,99,255,0.2)' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--primary)', marginBottom:10, textTransform:'uppercase', letterSpacing:'.5px' }}>📋 AI Summary</div>
            <div style={{ fontSize:14, lineHeight:1.8, color:'var(--text-secondary)', whiteSpace:'pre-line' }}>{summary}</div>
          </div>
        )}

        {/* Quiz */}
        {!aiLoading && activeAI === 'quiz' && quiz && (
          <div>
            {quiz.error ? (
              <div style={{ color:'var(--accent)', fontSize:14 }}>{quiz.error}</div>
            ) : (
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--primary)', marginBottom:14, textTransform:'uppercase', letterSpacing:'.5px' }}>
                  🧠 Quiz — {quiz.questions?.length} Questions
                </div>
                {quiz.questions?.map((q, i) => (
                  <div key={i} style={{ background:'var(--bg3)', borderRadius:12, padding:'1rem', marginBottom:12, border:'1px solid var(--border)' }}>
                    <div style={{ fontSize:14, fontWeight:600, marginBottom:10, color:'var(--text)' }}>Q{i+1}. {q.q}</div>
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                      {q.options?.map((opt, j) => {
                        const isSelected = quiz.selected?.[i] === opt;
                        const isCorrect = opt === q.answer;
                        let bg = 'var(--surface2)', border = 'var(--border)';
                        if (quiz.submitted) {
                          if (isCorrect) { bg = 'rgba(107,203,119,0.15)'; border = 'rgba(107,203,119,0.4)'; }
                          else if (isSelected) { bg = 'rgba(255,107,107,0.15)'; border = 'rgba(255,107,107,0.4)'; }
                        } else if (isSelected) { bg = 'rgba(108,99,255,0.15)'; border = 'rgba(108,99,255,0.4)'; }
                        return (
                          <div key={j} onClick={() => {
                            if (!quiz.submitted) setQuiz(prev => ({ ...prev, selected: { ...prev.selected, [i]: opt } }));
                          }} style={{ padding:'8px 14px', borderRadius:8, border:`1px solid ${border}`, background:bg, fontSize:13, cursor: quiz.submitted ? 'default' : 'pointer', color:'var(--text)', transition:'all .15s' }}>
                            {opt} {quiz.submitted && isCorrect && '✅'} {quiz.submitted && isSelected && !isCorrect && '❌'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {!quiz.submitted ? (
                  <button onClick={() => setQuiz(prev => ({ ...prev, submitted: true }))}
                    style={{ background:'linear-gradient(135deg,var(--primary),var(--primary-dark))', color:'#fff', border:'none', borderRadius:10, padding:'10px 24px', fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)' }}>
                    Submit Quiz
                  </button>
                ) : (
                  <div style={{ background:'rgba(108,99,255,0.1)', border:'1px solid rgba(108,99,255,0.3)', borderRadius:10, padding:'12px 16px', fontSize:14, color:'var(--text)' }}>
                    ✨ Score: <strong style={{ color:'var(--primary)' }}>
                      {quiz.questions?.filter((q,i) => quiz.selected?.[i] === q.answer).length} / {quiz.questions?.length}
                    </strong>
                    <button onClick={() => setQuiz(prev => ({ ...prev, selected:{}, submitted:false }))}
                      style={{ marginLeft:16, background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text-secondary)', borderRadius:8, padding:'4px 12px', cursor:'pointer', fontSize:13, fontFamily:'var(--font-body)' }}>
                      Retry
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Chat */}
        {activeAI === 'chat' && (
          <div>
            <div style={{ background:'var(--bg3)', borderRadius:12, padding:'1rem', border:'1px solid var(--border)', marginBottom:10, maxHeight:280, overflowY:'auto', display:'flex', flexDirection:'column', gap:10 }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ display:'flex', justifyContent: msg.role==='user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth:'80%', padding:'10px 14px', borderRadius:12, fontSize:13, lineHeight:1.6,
                    background: msg.role==='user' ? 'linear-gradient(135deg,var(--primary),var(--primary-dark))' : 'var(--surface2)',
                    color: msg.role==='user' ? '#fff' : 'var(--text-secondary)',
                    borderBottomRightRadius: msg.role==='user' ? 4 : 12,
                    borderBottomLeftRadius: msg.role==='ai' ? 4 : 12,
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {aiLoading && <div style={{ color:'var(--text-muted)', fontSize:13, paddingLeft:4 }}>AI is typing...</div>}
              <div ref={chatEndRef} />
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key==='Enter' && !aiLoading && sendChatMessage()}
                placeholder="Ask anything about these notes..."
                style={{ flex:1, padding:'10px 16px', border:'1px solid var(--border)', borderRadius:10, fontSize:14, background:'var(--surface2)', color:'var(--text)', fontFamily:'var(--font-body)' }} />
              <button onClick={sendChatMessage} disabled={aiLoading}
                style={{ padding:'10px 20px', background:'linear-gradient(135deg,var(--primary),var(--primary-dark))', color:'#fff', border:'none', borderRadius:10, cursor: aiLoading ? 'not-allowed' : 'pointer', fontWeight:700, fontFamily:'var(--font-body)', opacity: aiLoading ? 0.6 : 1 }}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rate & Download */}
      <div className="note-detail-card">
        <div className="section-title">Rate these notes</div>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
          <div className="star-selector">
            {[1,2,3,4,5].map(i => (
              <button key={i} className={`star-btn ${i<=(hoverStars||selectedStars)?'lit':''}`}
                onMouseEnter={() => setHoverStars(i)} onMouseLeave={() => setHoverStars(0)}
                onClick={() => handleRate(i)}>★</button>
            ))}
          </div>
          <span style={{ fontSize:14, color:'var(--text-secondary)' }}>
            Avg: <strong style={{ color:'#FFD93D' }}>{avg.toFixed(1)}</strong> ({totalRatings} ratings)
          </span>
        </div>
        <button className="download-btn" onClick={handleDownload}>⬇ Download Notes</button>
      </div>

      {/* Comments */}
      <div className="note-detail-card">
        <div className="section-title">Comments ({note.comments.length})</div>
        <div className="comment-form">
          <input value={comment} onChange={e => setComment(e.target.value)}
            placeholder={user ? 'Write a comment...' : 'Login to comment...'}
            disabled={!user} onKeyDown={e => e.key==='Enter' && handleComment()} />
          <button onClick={handleComment} disabled={!user}>Post</button>
        </div>
        {note.comments.length === 0 ? (
          <div style={{ color:'var(--text-muted)', fontSize:14 }}>No comments yet. Be the first!</div>
        ) : note.comments.map((c, i) => (
          <div key={i} className="comment-item">
            <div className="comment-author">{c.userName}</div>
            <div>{c.text}</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{new Date(c.createdAt).toLocaleDateString()}</div>
          </div>
        ))}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default NoteDetail;
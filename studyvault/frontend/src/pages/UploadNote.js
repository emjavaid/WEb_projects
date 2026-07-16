import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SUBJECTS = ['Computer Science', 'Mathematics', 'Physics', 'English', 'Economics', 'Other'];

const UploadNote = () => {
  const [form, setForm] = useState({
    title: '', subject: 'Computer Science', description: '', content: '', tags: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(''); // 'warning' | 'loading' | 'success' | 'error'
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAISuggest = async () => {
    if (!form.content.trim()) { setAiStatus('warning'); return; }
    setAiLoading(true);
    setAiStatus('loading');
    try {
      const { data } = await axios.post('/api/ai/suggest', { content: form.content });
      setForm((prev) => ({
        ...prev,
        subject: SUBJECTS.includes(data.subject) ? data.subject : prev.subject,
        tags: (data.tags || []).join(', '),
        description: data.description || prev.description,
      }));
      setAiStatus('success');
    } catch {
      setAiStatus('error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
      const res = await axios.post('/api/notes', payload);
      navigate(`/notes/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload note.');
    } finally {
      setLoading(false);
    }
  };

  const statusMap = {
    warning: { text: 'Please write the notes content first, then AI can suggest.', color: 'var(--accent2)' },
    loading: { text: 'AI is analyzing...', color: 'var(--text-secondary)' },
    success: { text: 'AI has suggested the subject, tags and description.', color: 'var(--accent3)' },
    error:   { text: 'AI could not generate suggestions. Please fill manually.', color: 'var(--accent)' },
  };
  const statusMsg = statusMap[aiStatus];

  return (
    <div className="container">
      <div className="form-card" style={{ maxWidth: 640, position: 'relative' }}>
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="Close"
          title="Close"
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 32, height: 32, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'var(--surface2)', color: 'var(--text-secondary)',
            fontSize: 16, lineHeight: '30px', textAlign: 'center',
            cursor: 'pointer', padding: 0,
          }}
        >
          ✕
        </button>
        <div className="form-title">Upload Your Notes</div>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" name="title" placeholder="e.g. Data Structures - Linked Lists & Trees"
              value={form.title} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Notes Content *</label>
            <textarea className="form-textarea" name="content" style={{ minHeight: 200 }}
              placeholder="Paste or type your notes here. Include key concepts, formulas, explanations..."
              value={form.content} onChange={handleChange} required />
          </div>

          {/* AI suggest button */}
          <div style={{ marginBottom: '1.5rem' }}>
            <button type="button" onClick={handleAISuggest} disabled={aiLoading} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 10,
              border: '1px solid rgba(108,99,255,0.5)',
              background: aiLoading ? 'var(--surface2)' : 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(75,68,204,0.25))',
              color: 'var(--primary)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14,
              cursor: aiLoading ? 'not-allowed' : 'pointer', transition: 'all .2s',
              boxShadow: aiLoading ? 'none' : '0 4px 16px rgba(108,99,255,0.15)',
            }}>
              {aiLoading
                ? 'AI is thinking...'
                : 'Suggest Subject, Tags & Description with AI'}
            </button>
            {statusMsg && (
              <div style={{
                marginTop: 8, fontSize: 13, color: statusMsg.color,
                padding: '7px 12px', background: 'var(--surface2)', borderRadius: 8, display: 'inline-block',
              }}>
                {statusMsg.text}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Subject * <span style={{ fontSize:11, color:'var(--primary)', fontWeight:400 }}>(AI auto-fill ↑)</span></label>
            <select className="form-select" name="subject" value={form.subject} onChange={handleChange}>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Short Description * <span style={{ fontSize:11, color:'var(--primary)', fontWeight:400 }}>(AI auto-fill ↑)</span></label>
            <input className="form-input" name="description" placeholder="Briefly describe what these notes cover..."
              value={form.description} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma separated) <span style={{ fontSize:11, color:'var(--primary)', fontWeight:400 }}>(AI auto-fill ↑)</span></label>
            <input className="form-input" name="tags" placeholder="e.g. linked list, trees, algorithms"
              value={form.tags} onChange={handleChange} />
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Notes'}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default UploadNote;
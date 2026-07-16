import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SUBJECTS = ['Computer Science', 'Mathematics', 'Physics', 'English', 'Economics', 'Other'];

const EditNote = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', subject: 'Computer Science', description: '', content: '', tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchNote(); }, [id]);

  const fetchNote = async () => {
    try {
      const { data } = await axios.get(`/api/notes/${id}`);
      // Only the owner can edit; redirect anyone else back to the note.
      if (!user || data.uploader?._id !== user._id) {
        navigate(`/notes/${id}`);
        return;
      }
      setForm({
        title: data.title,
        subject: data.subject,
        description: data.description,
        content: data.content,
        tags: (data.tags || []).join(', '),
      });
    } catch (err) {
      setError('Failed to load note.');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
      await axios.put(`/api/notes/${id}`, payload);
      navigate(`/notes/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update note.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading">Loading note</div>;

  return (
    <div className="container">
      <div className="form-card" style={{ maxWidth: 640, position: 'relative' }}>
        <button
          type="button"
          onClick={() => navigate(`/notes/${id}`)}
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
        <div className="form-title">Edit Your Notes</div>
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

          <div className="form-group">
            <label className="form-label">Subject *</label>
            <select className="form-select" name="subject" value={form.subject} onChange={handleChange}>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Short Description *</label>
            <input className="form-input" name="description" placeholder="Briefly describe what these notes cover..."
              value={form.description} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input className="form-input" name="tags" placeholder="e.g. linked list, trees, algorithms"
              value={form.tags} onChange={handleChange} />
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditNote;
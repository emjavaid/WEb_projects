import React from 'react';
import { Link } from 'react-router-dom';

const subjectClass = {
  'Computer Science': 'subject-cs',
  'Mathematics': 'subject-math',
  'Physics': 'subject-phy',
  'English': 'subject-eng',
  'Economics': 'subject-eco',
  'Other': 'subject-other',
};

const NoteCard = ({ note }) => {
  const avg = note.averageRating || 0;
  const stars = '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg));

  return (
    <Link to={`/notes/${note._id}`} className="note-card">
      <span className={`card-subject ${subjectClass[note.subject] || 'subject-other'}`}>
        {note.subject}
      </span>
      <div className="card-title">{note.title}</div>
      <div className="card-desc">{note.description.slice(0, 90)}{note.description.length > 90 ? '...' : ''}</div>
      <div className="card-footer">
        <span className="stars">{stars} <span style={{ color: '#888', fontWeight: 400 }}>{avg.toFixed(1)}</span></span>
        <span className="meta-small">{note.downloads} downloads · {note.uploaderName}</span>
      </div>
    </Link>
  );
};

export default NoteCard;

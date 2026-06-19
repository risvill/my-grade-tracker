import { useState, useEffect } from 'react';
import { FileText, Trash2 } from 'lucide-react';
import '../../styles/globals.scss';

interface NoteBlockProps {
  note: string | null;
  label: string;
  onSave: (newNote: string) => void;
  onDelete: () => void;
}

export const NoteBlock = ({ note, label, onSave, onDelete }: NoteBlockProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempNote, setTempNote] = useState('');

  useEffect(() => {
    if (isModalOpen) setTempNote(note || '');
  }, [isModalOpen, note]);

  return (
    <>
      <div className="note-container" onClick={() => setIsModalOpen(true)}>
        <div className="note-content-wrapper">
          <FileText size={16} color="#aeb2b7" />
          <p className={`note-text ${!note ? 'note-placeholder' : ''}`}>
            {note || 'Note not added'}
          </p>
        </div>

        {note && (
          <button 
            className="delete-btn" 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <Trash2 size={16} color="#e53e3e" />
          </button>
        )}
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit {label}</h3>
            <textarea 
              className="modal-textarea"
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
              maxLength={200}
            />
            <div className="char-counter" style={{ fontSize: '12px', color: '#718096' }}>
              {tempNote.length}/200
            </div>
            <div className='modal-buttons'>
              <button onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button onClick={() => { onSave(tempNote); setIsModalOpen(false); }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
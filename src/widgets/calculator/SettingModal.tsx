import { useState, useEffect } from 'react';
import { supabase } from './../../utils/supabaseClient';

interface SettingsModalProps {
  isModalOpen: boolean; // Переименовали
  userId: string;
  onClose: () => void;
  onSave: () => void;
}

export const SettingsModal = ({ isModalOpen, userId, onClose, onSave }: SettingsModalProps) => {
  if (!isModalOpen) return null;
  const [course, setCourse] = useState(1);
  const [semester, setSemester] = useState(1);

  // При открытии тянем текущие настройки из базы
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setCourse(data.current_course);
        setSemester(data.current_semester);
      }
    };
    fetchSettings();
  }, [userId]);

  const handleSave = async () => {
    await supabase.from('profiles').update({ 
      current_course: course, 
      current_semester: semester 
    }).eq('id', userId);
    
    onSave(); // Обновит данные в CalculatorWidget
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Academic Settings</h3>
        <label>Course</label>
        <select value={course} onChange={(e) => setCourse(Number(e.target.value))}>
          {[1, 2, 3, 4].map(c => <option key={c} value={c}>{c} Course</option>)}
        </select>
        
        <label>Semester</label>
        <select value={semester} onChange={(e) => setSemester(Number(e.target.value))}>
          {[1, 2, 3].map(s => <option key={s} value={s}>{s} Semester</option>)}
        </select>
        
        <div className="modal-buttons">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};
import { useState, useEffect } from 'react';
import { supabase } from './../../utils/supabaseClient';

interface SettingsModalProps {
  isModalOpen: boolean;
  userId: string;
  onClose: () => void;
  onSave: (newSettings: { course: number; semester: number }) => void; 
}

export const SettingsModal = ({ isModalOpen, userId, onClose, onSave }: SettingsModalProps) => {
  const [course, setCourse] = useState(1);
  const [semester, setSemester] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      const fetchSettings = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('current_course, current_semester')
    .eq('id', userId); 

  if (error) {
    console.error("Ошибка:", error);
  } else if (data && data.length > 0) {
    setCourse(data[0].current_course);
    setSemester(data[0].current_semester);
  }
};
      fetchSettings();
    }
  }, [isModalOpen, userId]);

  const handleSave = async () => {
  setLoading(true);

  const { data, error } = await supabase
    .from('profiles')
    .upsert({ 
      id: userId, 
      current_course: course, 
      current_semester: semester 
    })
    .select(); 
    
  if (error) {
    console.error("DEBUG: ОШИБКА UPSERT:", error);
  } else {
    console.log("DEBUG: Успешно сохранено (upsert):", data);
    onSave({ course, semester });
    onClose();
  }
  
  setLoading(false);
};

  if (!isModalOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Academic Settings</h3>
        
        <div className="settings-form">
            <div className="form-group">
                <label>Course</label>
                <select value={course} onChange={(e) => setCourse(Number(e.target.value))}>
                {[1, 2, 3, 4].map(c => <option key={c} value={c}>{c} Course</option>)}
                </select>
            </div>
                    
            <div className="form-group">
                <label>Semester</label>
                <select value={semester} onChange={(e) => setSemester(Number(e.target.value))}>
                <option value={1}>1 Semester</option>
                <option value={2}>2 Semester</option>
                <option value={3}>Summer Semester</option>
                </select>
            </div>
            </div>
        
        <div className="modal-buttons">
          <button onClick={onClose} disabled={loading}>Cancel</button>
          <button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
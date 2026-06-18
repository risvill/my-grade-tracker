import React, { useState } from 'react';
import Papa from 'papaparse';
import { supabase } from '../..//utils/supabaseClient'; // Убедись, что путь правильный

interface ImportModalProps {
  userId: string | null;
  course: number;
  semester: number;
  onClose: () => void;
  onImportSuccess: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ 
  userId, 
  course, 
  semester, 
  onClose, 
  onImportSuccess 
}) => {
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  setLoading(true);

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      try {
        const importedData = results.data.map((item: any, index) => {
          // Валидация: если нет оценок, выбрасываем ошибку
          if (!item.title || !item.rk1 || !item.rk2 || !item.exam || !item.total_percent) {
                throw new Error(`Ошибка в строке ${index + 1}: У предмета "${item.title}" не хватает данных для завершения!`);
            }

            return {
                user_id: userId,
                course: course,
                semester: semester,
                title: item.title,
                rk1: Number(item.rk1),
                rk2: Number(item.rk2),
                exam: Number(item.exam),
                total_percent: Number(item.total_percent), // Теперь мы используем твое название
            };
        });

        // Отправка в базу
        const { error } = await supabase.from('grades').insert(importedData);
        if (error) throw error;

        alert("Предметы успешно импортированы!");
        onImportSuccess();
        onClose();
      } catch (err: any) {
        alert(err.message); // Пользователь увидит, какой именно предмет не прошел проверку
      } finally {
        setLoading(false);
      }
    }
  });
};

  return (
    <div className="modal">
  <div className="modal-content import-modal">
    <h3>Import Subjects (CSV)</h3>
    <p>To ensure a successful import, your file must contain the following headers:</p>
    <ul className="csv-requirements">
      <li><b>title</b> (subject name)</li>
      <li><b>rk1, rk2, exam</b> (scores for RKs)</li>
      <li><b>total_percent</b> (final percentage)</li>
    </ul>

    <div className="file-input-wrapper">
      <input 
        type="file" 
        accept=".csv" 
        onChange={handleFileUpload} 
        disabled={loading} 
        id="fileInput"
      />
      <label htmlFor="fileInput" className="file-label">
        {loading ? "Uploading..." : "Select CSV file"}
      </label>
    </div>
    
    <button className="modal-btn" onClick={onClose} disabled={loading}>
      Close
    </button>
  </div>
</div>
  );
};
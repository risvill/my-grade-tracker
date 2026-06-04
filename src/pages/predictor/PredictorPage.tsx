import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { PredictorWidget } from "../../widgets/predictor/PredictorWidget";
import { SafetyNetWidget } from "../../widgets/predictor/SafetyNetWidget";

export const PredictorPage = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [target, setTarget] = useState(4); // 3, 4 или 5

  useEffect(() => {
    const fetchSubjects = async () => {
      const { data } = await supabase.from('grades').select('*');
      if (data) setSubjects(data);
    };
    fetchSubjects();
  }, []);

  return (
    <div className="main-content-container">
      <h1>Предиктор успеваемости</h1>

      {/* Выбор предмета */}
      <select onChange={(e) => setSelectedSubject(subjects.find(s => s.id == e.target.value))}>
        <option value="">Выберите предмет...</option>
        {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
      </select>

        {selectedSubject && (
        <>
          <PredictorWidget subject={selectedSubject} />
        </>
      )}

      {/* Выбор цели (кнопки как на твоем скриншоте) */}
      <div className="target-selector">
        {[3, 4, 5].map(t => (
          <button 
            key={t} 
            className={target === t ? 'active' : ''} 
            onClick={() => setTarget(t)}
          >
            Target: {t}
          </button>
        ))}
      </div>

        {selectedSubject && (
        <>
          <SafetyNetWidget rkAverage={(Number(selectedSubject.rk1) + Number(selectedSubject.rk2)) / 2} />
        </>
      )}
      
    </div>
  );
};
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { PredictorWidget } from "../widgets/predictor/PredictorWidget";
import { SafetyNetWidget } from "../widgets/predictor/SafetyNetWidget";
import {MetricsSection} from "../widgets/predictor/MetricsSection"

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

      <select onChange={(e) => setSelectedSubject(subjects.find(s => s.id == e.target.value))}>
        <option value="">Выберите предмет...</option>
        {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
      </select>

        {/* Выбор предмета */}

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
      {/* Выбор предмета */}
      

        {selectedSubject && (
        <>
          <PredictorWidget subject={selectedSubject} target={target} />
        </>
      )}


      

        {selectedSubject && (
        <>
          <SafetyNetWidget rkAverage={(Number(selectedSubject.rk1) + Number(selectedSubject.rk2)) / 2} />
        </>
      )}


        {selectedSubject && (
        <>
           <MetricsSection subject={selectedSubject} target={target} />
        </>
      )}
     
      
    </div>
  );
};
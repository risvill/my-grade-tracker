import { useContext, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { SubjectContext } from "../utils/SubjectContext";
import { PredictorWidget } from "../widgets/predictor/PredictorWidget";
import { SafetyNetWidget } from "../widgets/predictor/SafetyNetWidget";
import {MetricsSection} from "../widgets/predictor/MetricsSection"

export const PredictorPage = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [target, setTarget] = useState(4); // 3, 4 или 5
  const { activeSubject } = useContext(SubjectContext);
  console.log("PredictorPage: данные из контекста:", activeSubject);
  if (!activeSubject) {
      return (
        <div className="main-content-container" style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>No subject selected</h2>
          <p>Go to the Calculator page and select a subject from your history.</p>
        </div>
      );
    }

  return (
    <div className="main-content-container">
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
          <PredictorWidget subject={activeSubject} target={target} />
        </>
      )}


      

        {selectedSubject && (
        <>
          <SafetyNetWidget rkAverage={(Number(activeSubject.rk1) + Number(activeSubject.rk2)) / 2} />
        </>
      )}


        {selectedSubject && (
        <>
           <MetricsSection subject={activeSubject} target={target} />
        </>
      )}
     
      
    </div>
  );
};
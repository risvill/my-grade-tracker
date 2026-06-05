import { useContext, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { SubjectContext } from "../utils/SubjectContext";
import { PredictorWidget } from "../widgets/predictor/PredictorWidget";
import { SafetyNetWidget } from "../widgets/predictor/SafetyNetWidget";
import {MetricsSection} from "../widgets/predictor/MetricsSection"

export const PredictorPage = () => {
  const [target, setTarget] = useState(4); // 3, 4 или 5
  const { activeSubject } = useContext(SubjectContext);
  console.log("PredictorPage: данные из контекста:", activeSubject);
  if (!activeSubject) {
      return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h1>No subject selected</h1>
          <p>Go to the Calculator page and select a subject from your history.</p>
        </div>
      );
    }

  return (
    
    <div className="main-content-container2">
      <div className="card">
      <div className="target-selector">
        {[3, 4, 5].map(t => (
          <button 
            key={t} 
            className={target === t ? 'active' : ''} 
            onClick={() => setTarget(t)}
            style={{fontSize: '16px'}}
          >
            Target: {t}
          </button>
        ))}
      </div>
      </div>

      {/* Выбор предмета */}
      
        <h2 className="card_title">🎯 How to Reach Goal</h2>
        {activeSubject && (
        <>
          <PredictorWidget subject={activeSubject} target={target} />
        </>
      )}


      
        <h2 className="card_title">🛡️ Safety Net</h2>
        {activeSubject && (
        <>
          <SafetyNetWidget rkAverage={(Number(activeSubject.rk1) + Number(activeSubject.rk2)) / 2} />
        </>
      )}

       <h2 className="card_title">Metrics</h2>
        {activeSubject && (
        <>
           <MetricsSection subject={activeSubject} target={target} />
        </>
      )}
     
      
    </div>
  );
};
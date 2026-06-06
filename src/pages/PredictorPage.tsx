import { useContext, useState } from "react";
import { SubjectContext } from "../utils/SubjectContext";
import { PredictorWidget } from "../widgets/predictor/PredictorWidget";
import { SafetyNetWidget } from "../widgets/predictor/SafetyNetWidget";
import { MetricsSection } from "../widgets/predictor/MetricsSection";
import { getPredictionState } from '../utils/predictionUtils';
import { useNavigate } from "react-router-dom"; 

export const PredictorPage = () => {
  const [target, setTarget] = useState(4);
  const { activeSubject } = useContext(SubjectContext);
  const navigate = useNavigate();

  if (!activeSubject) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>No subject selected</h1>
        <button onClick={() => navigate('/calculator')}>Go to Calculator</button>
      </div>
    );
  }


  const data = { 
    rk1: activeSubject.rk1, 
    rk2: activeSubject.rk2, 
    exam: activeSubject.exam, 
    currentGrades: activeSubject.fa_grades || [] 
  };

  const state = getPredictionState(data);

  // --- Рендер в зависимости от состояния ---

  // State 0: Пусто
  if (state === 'EMPTY_ALL') {
    return (
      <div className="card">
        <p>Для начала создайте оценки по предмету в Калькуляторе.</p>
        <button onClick={() => navigate('/calculator')}>Перейти в Калькулятор</button>
      </div>
    );
  }

  // State 1: Only FA, without RK or Exam
  if (state === 'ONLY_ANALYTICS') {
    return (
      <div className="card">
        <p>Your current results do not affect your final score in any way; they are only needed to identify your progress.</p>
        <button onClick={() => navigate('/analytics')}>Go to analytics</button>
      </div>
    );
  }

  // State 2: Активный режим
  return (
    <div className="main-content-container2">
      <div className="card">
        <div className="target-selector">
          {/* Map through potential targets (3, 4, 5) to dynamically render selection buttons */}
          {[3, 4, 5].map(t => (
            <button 
              key={t} 
              /* Apply 'active' class conditionally for visual feedback */
              className={target === t ? 'active' : ''} 
              /* Update the local target state when the user selects a goal */
              onClick={() => setTarget(t)}
            >
              Target: {t}
            </button>
          ))}
        </div>
      </div>
      <h2 className="card_title">🎯 How to Reach Goal</h2>
      
      {/* The PredictorWidget is the 'controller' component. 
        We pass it the 'activeSubject' (from Context) and the user's selected 'target'.
        This forces the widget to re-calculate whenever these props change. 
      */}
      <PredictorWidget subject={activeSubject} target={target} />

      {target !== 3 && (
        <>
          <h2 className="card_title">🛡️ Safety Net</h2>
          <SafetyNetWidget 
            rk1={activeSubject.rk1} 
            rk2={activeSubject.rk2} 
            exam={activeSubject.exam} 
            target={target}
          />
        </>
      )}
      <h2 className="card_title">Metrics</h2>
      <MetricsSection subject={activeSubject} target={target} />
    </div>
  );
};
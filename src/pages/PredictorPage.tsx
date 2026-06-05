import { useContext, useState } from "react";
import { SubjectContext } from "../utils/SubjectContext";
import { PredictorWidget } from "../widgets/predictor/PredictorWidget";
import { SafetyNetWidget } from "../widgets/predictor/SafetyNetWidget";
import { MetricsSection } from "../widgets/predictor/MetricsSection";
import { getPredictionState } from '../utils/predictionUtils';
import { useNavigate } from "react-router-dom"; // Предполагаю, что используешь react-router

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

  // Подготовка данных для нашей логики
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

  // State 1: Есть только текущие, нет РК
  if (state === 'ONLY_ANALYTICS') {
    return (
      <div className="card">
        <p>Ваши текущие оценки никак не влияют на итоговый балл, они нужны лишь для отслеживания прогресса.</p>
        <button onClick={() => navigate('/analytics')}>Перейти к аналитике</button>
      </div>
    );
  }

  // State 2: Активный режим
  return (
    <div className="main-content-container2">
      <div className="card">
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
      </div>

      <h2 className="card_title">🎯 How to Reach Goal</h2>
      <PredictorWidget subject={activeSubject} target={target} />

      <h2 className="card_title">🛡️ Safety Net</h2>
      <SafetyNetWidget 
         rkAverage={(Number(activeSubject.rk1 || 0) + Number(activeSubject.rk2 || 0)) / 2} 
      />

      <h2 className="card_title">Metrics</h2>
      <MetricsSection subject={activeSubject} target={target} />
    </div>
  );
};
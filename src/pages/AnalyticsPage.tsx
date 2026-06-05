import { useContext, useEffect } from "react";
import { SubjectContext } from "../utils/SubjectContext";
import { useNavigate } from "react-router-dom";
import { ValidityWidget } from "../widgets/analytics/ValidityWidget";
import { TrendsWidget } from "../widgets/analytics/TrendsWidget";
import { MetricCard } from "../widgets/analytics/MetricCard";
import { TrendingUp, Activity, HelpCircle } from "lucide-react";
import styles from "../widgets/analytics/AnalyticsWidget.module.scss";

export const AnalyticsPage = () => {
  const { activeSubject } = useContext(SubjectContext);
  const navigate = useNavigate();

  // Если предмет не выбран, перенаправляем или показываем заглушку
  if (!activeSubject) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>No subject selected</h1>
        <p>Please select a subject in the Calculator to view analytics.</p>
        <button onClick={() => navigate('/calculator')}>Go to Calculator</button>
      </div>
    );
  }

  // ВЫЧИСЛЕНИЯ теперь работают напрямую с activeSubject
const rawGrades = activeSubject?.fa_grades;

let fa: number[] = [];

if (Array.isArray(rawGrades)) {
  // Достаем именно поле 'value' из каждого объекта
  fa = rawGrades.map((item: any) => Number(item.value));
} else if (typeof rawGrades === 'string') {
  try {
    const parsed = JSON.parse(rawGrades);
    fa = Array.isArray(parsed) ? parsed.map((item: any) => Number(item.value)) : [];
  } catch (e) {
    console.error("Ошибка парсинга:", e);
    fa = [];
  }
}

// Теперь fa будет [90, 100, ...] — чистые числа!
console.log("Чистый массив для графиков:", fa);
const trendFa = fa.slice(-7);
const latestFa = fa.slice(-5);
  const mean = fa.length ? fa.reduce((a, b) => a + b, 0) / fa.length : 0;
  const variance = fa.length ? fa.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / fa.length : 0;
  const stdDev = Math.sqrt(variance);

  // Логика тренда
  let trendStatus = 'Neutral';
  if (fa.length >= 2) {
    const current = fa[fa.length - 1];
    const previous = fa[fa.length - 2];
    trendStatus = current > previous ? 'Progress' : (current < previous ? 'Regress' : 'Neutral');
  }

  // Логика волатильности
  let volatilityPercentage = 10;
  let barColor = '#10b981';
  
  if (fa.length >= 2) {
    const diff = Math.abs(fa[fa.length - 1] - fa[fa.length - 2]);
    if (diff < 3) { volatilityPercentage = 10; barColor = '#10b981'; }
    else if (diff >= 3 && diff <= 10) { volatilityPercentage = 30; barColor = '#10b981'; }
    else if (diff >= 11 && diff <= 15) { volatilityPercentage = 60; barColor = '#f59e0b'; }
    else { volatilityPercentage = 90; barColor = '#ef4444'; }
  }

  return (
    <div className="main-content-container3">

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <ValidityWidget
          faGrades={latestFa}
          rk1={Number(activeSubject.rk1 || 0)}
          rk2={Number(activeSubject.rk2 || 0)} 
        />
        <TrendsWidget faGrades={trendFa} />
      </div>
          
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
        <MetricCard icon={TrendingUp} title="TREND">
          <div className={styles.trendBadge} style={{ 
            backgroundColor: trendStatus === 'Progress' ? '#10b981' : 
                             trendStatus === 'Regress' ? '#ef4444' : '#64748b' 
          }}>
            {trendStatus}
          </div>
          <p style={{ margin: '5px', fontSize: '0.8rem', color: '#64748b' }}>FA Dynamics Evaluation</p>
        </MetricCard>

        <MetricCard icon={Activity} title="VOLATILITY">
            <div className={styles.volatilityBar}>
                <div 
                className={styles.volatilityFill} 
                style={{ width: `${volatilityPercentage}%`, backgroundColor: barColor }} 
                />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '0px', color: '#64748b' }}>
                <span>Stable</span>
                <span>Unstable</span>
            </div>
        </MetricCard>

        <MetricCard icon={HelpCircle} title="MEAN SCORE" value={mean.toFixed(1)} subValue={`±${stdDev.toFixed(2)}`} />
      </div>
    </div>
  );
};
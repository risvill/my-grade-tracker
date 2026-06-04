import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ValidityWidget } from "../widgets/analytics/ValidityWidget";
import { TrendsWidget } from "../widgets/analytics/TrendsWidget";
import { MetricCard } from "../widgets/analytics/MetricCard";
import { TrendingUp, Activity, HelpCircle } from "lucide-react";
import styles from "../widgets/analytics/AnalyticsWidget.module.scss";

export const AnalyticsPage = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      const { data } = await supabase.from('grades').select('*');
      if (data) setSubjects(data);
    };
    fetchSubjects();
  }, []);

  // ВЫЧИСЛЕНИЯ (безопасно, только если предмет выбран)
  const fa: number[] = selectedSubject 
    ? (selectedSubject.fa_grades || []).map((g: any) => Number(g)) 
    : [];

  const mean = fa.length ? fa.reduce((a: number, b: number) => a + b, 0) / fa.length : 0;
  const variance = fa.length ? fa.reduce((sq: number, n: number) => sq + Math.pow(n - mean, 2), 0) / fa.length : 0;
  const stdDev = Math.sqrt(variance);


  const current = fa[fa.length - 1];
  const prev = fa[fa.length - 2];
  const diff = Math.abs(current - prev);

    let barColor = '#10b981'; // По умолчанию зеленый
    if (diff >= 3 && diff <= 10) barColor = '#10b981'; // Зеленый
    else if (diff > 10 && diff <= 15) barColor = '#f59e0b'; // Оранжевый
    else if (diff > 15) barColor = '#ef4444'; // Красный
// Логика индикатора:
let volatilityPercentage = Math.min((diff / 15) * 100, 100);

if (fa.length > 1) {

 // Используем модуль разницы

  if (diff < 3) {
    // Очень маленькое изменение — идеально стабильно
    volatilityPercentage = 10; 
  } else if (diff >= 3 && diff <= 10) {
    // Твой зеленый диапазон (Стабильно)
    volatilityPercentage = 30; 
  } else if (diff >= 11 && diff <= 15) {
    // Твой оранжевый диапазон (Средне)
    volatilityPercentage = 60;
  } else {
    // Больше 15 — красный (Нестабильно)
    volatilityPercentage = 90;
  }
}
  let trendStatus = 'Neutral';
  if (fa.length >= 2) {
    const current = fa[fa.length - 1];
    const previous = fa[fa.length - 2];
    trendStatus = current > previous ? 'Progress' : (current < previous ? 'Regress' : 'Neutral');
  }

  return (
    <div className="main-content-container">
      <h1>Аналитика и тренды</h1>

      <div className="selector-container" style={{ marginBottom: '20px' }}>
        <select 
          onChange={(e) => setSelectedSubject(subjects.find(s => s.id == e.target.value))}
          style={{ padding: '10px', borderRadius: '8px', width: '100%' }}
        >
          <option value="">Выберите предмет для анализа...</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
      </div>

      {selectedSubject ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <ValidityWidget
              faGrades={fa}
              rk1={Number(selectedSubject.rk1 || 0)}
              rk2={Number(selectedSubject.rk2 || 0)} 
            />
            <TrendsWidget faGrades={fa} />
          </div>
              
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
            <MetricCard icon={TrendingUp} title="ТРЕНД">
              <div className={styles.trendBadge} style={{ 
                backgroundColor: trendStatus === 'Progress' ? '#10b981' : 
                                 trendStatus === 'Regress' ? '#ef4444' : '#64748b' 
              }}>
                {trendStatus}
              </div>
            </MetricCard>

            <MetricCard icon={Activity} title="VOLATILITY">
                <div className={styles.volatilityBar}>
                    <div 
                    className={styles.volatilityFill} 
                    style={{ 
                        width: `${volatilityPercentage}%`, 
                        backgroundColor: barColor // Используем переменную цвета
                    }} 
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '5px' }}>
                    <span>Stable</span>
                    <span>Unstable</span>
                </div>
                </MetricCard>

            <MetricCard icon={HelpCircle} title="MEAN SCORE" value={mean.toFixed(1)} subValue={`±${stdDev.toFixed(2)}`} />
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p>Выберите предмет, чтобы увидеть аналитику.</p>
        </div>
      )}
    </div>
  );
};
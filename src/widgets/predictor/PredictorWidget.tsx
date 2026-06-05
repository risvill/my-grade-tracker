import { useContext } from "react";
import { SubjectContext } from "../../utils/SubjectContext";

export const PredictorWidget = ({ subject: propSubject, target }: { subject?: any, target: number }) => {
  const { activeSubject } = useContext(SubjectContext);
  const subject = propSubject || activeSubject;

  if (!subject) return null;

  const rkAvg = (Number(subject.rk1 || 0) + Number(subject.rk2 || 0)) / 2;
  const currentTotal = (rkAvg * 0.6); 

  const ranges: Record<number, { min: number, max: number }> = {
    3: { min: 50, max: 69 },
    4: { min: 70, max: 89 },
    5: { min: 90, max: 100 }
  };

  const getNeededScore = (targetPercent: number) => {
    const needed = (targetPercent - currentTotal) / 0.4;
    return Math.max(0, Math.min(100, needed)).toFixed(1);
  };

  return (
    <section className="card" style={{ marginTop: '20px' }}>
      <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '16px' }}>
        <p style={{marginBottom: '8px'}}>To achieve <strong>{target}</strong> you have to pass:</p>
        <h2 style={{ color: 'var(--accent-primary)', marginBottom: '5px' }}>
          from {getNeededScore(ranges[target].min)}% to {getNeededScore(ranges[target].max)}%
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          * If your avg score is: {rkAvg.toFixed(1)}%
        </p>
      </div>
    </section>
  );
};
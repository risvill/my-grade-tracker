import { useContext } from "react";
import { SubjectContext } from "../../utils/SubjectContext";

export const PredictorWidget = ({ subject: propSubject, target }: { subject?: any, target: number }) => {
  const { activeSubject } = useContext(SubjectContext);
  const subject = propSubject || activeSubject;

  if (!subject) return null;

  const rk1 = subject.rk1 !== null ? Number(subject.rk1) : null;
  const rk2 = subject.rk2 !== null ? Number(subject.rk2) : null;
  const exam = subject.exam !== null ? Number(subject.exam) : null;

  const ranges: Record<number, { min: number }> = {
    3: { min: 50 },
    4: { min: 70 },
    5: { min: 90 }
  };
  const targetMin = ranges[target].min;


  const renderPrediction = () => {
    if (rk1 !== null && rk2 !== null && exam !== null) {
      const final = ((rk1 + rk2) / 2) * 0.6 + (exam * 0.4);
      return <p>You have already received all your grades. Your final score is: <strong>{final.toFixed(1)}%</strong></p>;
    }

    if (rk1 !== null && rk2 !== null) {
      const rkAvg = (rk1 + rk2) / 2;
      const neededExam = (targetMin - (rkAvg * 0.6)) / 0.4;
      
      return (
        <>
          <p>Current average rating (RK1+RK2): <strong>{rkAvg.toFixed(1)}%</strong></p>
          <p>To achive a grade of <strong>{target}</strong>, your minimum score on the exam must be:</p>
          <h2 style={{ color: 'var(--accent-primary)' }}>{Math.max(0, neededExam).toFixed(1)}%</h2>
        </>
      );
    }
    // 3. Есть только РК1, готовимся к РК2 (фокус на средний рейтинг)
    if (rk1 !== null) {
      // Чтобы средний рейтинг (РК1+РК2)/2 был равен TargetMin
      const neededRk2 = (targetMin * 2) - rk1;
      
      return (
        <>
          <p>Current RК1: <strong>{rk1.toFixed(1)}%</strong></p>
          <p>To achieve Average Rating (RК1+RК2)/2, your minimum score on the exam must be:</p>
          <h2 style={{ color: 'var(--accent-primary)' }}>
            {neededRk2 > 100 
              ? "Цель недостижима с РК1" 
              : `${Math.max(0, neededRk2).toFixed(1)}%`}
          </h2>
          <p style={{ fontSize: '0.85rem' }}>* Это необходимо только для среднего рейтинга.</p>
        </>
      );
    }

    return <p>Please enter your grades into the calculator to see the forecast.</p>;
  };

  return (
    <section className="card" style={{ marginTop: '20px' }}>
      <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '16px' }}>
        {renderPrediction()}
      </div>
    </section>
  );
};
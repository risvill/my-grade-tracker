import { useContext } from "react";
import { SubjectContext } from "../../utils/SubjectContext";

export const PredictorWidget = ({ subject: propSubject, target }: { subject?: any, target: number }) => {
  // Getting active subject from context if it was not passed as prop
  const { activeSubject } = useContext(SubjectContext);
  const subject = propSubject || activeSubject;

  // If subject is not selected, render nothing (error protection)
  if (!subject) return null;

  // Converting scores to Number format for mathematical calculations
  const rk1 = subject.rk1 !== null ? Number(subject.rk1) : null;
  const rk2 = subject.rk2 !== null ? Number(subject.rk2) : null;
  const exam = subject.exam !== null ? Number(subject.exam) : null;

  // Defining score thresholds for each target
  const ranges: Record<number, { min: number }> = {
    3: { min: 50 },
    4: { min: 70 },
    5: { min: 90 }
  };
  
  // Getting the minimum required score for the selected target
  const targetMin = ranges[target].min;

  const renderPrediction = () => {
    // 1. Полностью завершен
    if (rk1 !== null && rk2 !== null && exam !== null) {
      const final = ((rk1 + rk2) / 2) * 0.6 + (exam * 0.4);
      return (
        <div style={{ textAlign: 'center' }}>
          <p>Course completed!</p>
          <h2 style={{ color: 'var(--accent-primary)' }}>{final.toFixed(1)}%</h2>
        </div>
      );
    }

    // 2. Есть РК1 и РК2, ждем экзамен
if (rk1 !== null && rk2 !== null) {
  const rkAvg = (rk1 + rk2) / 2;
  const neededExam = (targetMin - (rkAvg * 0.6)) / 0.4;
  const isPossible = neededExam <= 100;

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ marginBottom: '5px', fontWeight: '600', fontSize: '18px' }}>
        Current Average: {rkAvg.toFixed(1)}%
      </p>
      <p style={{ marginBottom: '5px' }}>(Need Average {targetMin}%)</p>
      
      <h1 style={{ color: 'var(--accent-primary)', fontSize: '2.5rem', margin: '10px 0' }}>
        {isPossible ? `${Math.max(0, neededExam).toFixed(0)}%` : "Impossible"}
      </h1>
      
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Required on Exam</p>
      
      <div style={{ marginTop: '15px', background: '#e0e0e0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ 
          width: `${Math.min(Math.max(0, neededExam), 100)}%`, 
          height: '100%', 
          background: isPossible ? 'var(--accent-primary)' : '#ff4d4f', 
          borderRadius: '3px' 
        }} />
      </div>
    </div>
  );
}

    // 3. Есть только РК1, готовимся к РК2
    // If RK1 already exists, start prediction calculations
if (rk1 !== null) {
  // Calculating how many points are needed on RK2
  // to achieve the target average (targetMin)
  const neededRk2 = (targetMin * 2) - rk1;
  // Checking if such score is realistically possible (not above 100%)
  const isPossible = neededRk2 <= 100;
  return (
    <div style={{ textAlign: 'center' }}>
      {/* Displaying current progress and target average score */}
      <p style={{ marginBottom: '5px', fontWeight:'600', fontSize: '18px'}}>
        Current RK1: {rk1.toFixed(1)}%
      </p>
      <p style={{ marginBottom: '5px' }}>
        (Need Average {targetMin}%)
      </p>
      {/* Showing result or "Impossible" if target cannot be reached */}
      <h1 style={{ color: 'var(--accent-primary)', fontSize: '2.5rem', margin: '10px 0' }}>
        {isPossible ? `${Math.max(0, neededRk2).toFixed(0)}%` : "Impossible"}
      </h1><p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Required on RK2</p>
      {/* Visual progress scale (Progress Bar) */}
      <div style={{ 
        marginTop: '15px',
        background: '#e0e0e0',
        height: '6px',
        borderRadius: '3px',
        overflow: 'hidden'
      }}>
        <div style={{ 
          width: `${Math.min(Math.max(0, neededRk2), 100)}%`, // Dynamic bar width
          height: '100%',
          background: isPossible ? 'var(--accent-primary)' : '#ff4d4f', // Color changes if target is impossible
          borderRadius: '3px'
        }} />
      </div>
    </div>
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
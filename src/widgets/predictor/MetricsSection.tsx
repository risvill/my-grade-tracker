import { useState } from 'react';

export const MetricsSection = ({ subject, target }: { subject: any, target: number }) => {
  const [hypotheticalScore, setHypotheticalScore] = useState<string>('');
  
  const isWaitingForExam = subject.rk1 !== null && subject.rk2 !== null;
  const isWaitingForRk2 = subject.rk1 !== null && subject.rk2 === null;

  const calculateResult = () => {
    const score = parseFloat(hypotheticalScore);
    if (isNaN(score)) return null;

    if (isWaitingForRk2) {
      const avg = ((Number(subject.rk1) || 0) + score) / 2;
      return { avg: avg, type: 'RK2' };
    }
    if (isWaitingForExam) {
      const rkAvg = ((Number(subject.rk1) || 0) + (Number(subject.rk2) || 0)) / 2;
      const total = (rkAvg * 0.6) + (score * 0.4);
      return { avg: total, type: 'exam' };
    }
    return null;
  };

  const result = calculateResult(); // Вот наш результат
  
  const rkAvg = ((Number(subject.rk1) || 0) + (Number(subject.rk2) || 0)) / 2;
  const currentTotal = (rkAvg * 0.6);
  const targetPercent = target === 3 ? 50 : target === 4 ? 70 : 90;
  const neededFromExam = Math.max(0, (targetPercent - currentTotal) / 0.4);
  const probability = Math.max(0, Math.min(100, 100 - neededFromExam));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
      
      <section className="card" style={{ minHeight: '180px' }}>
        <h3>🤔 What if?</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', marginTop: '15px' }}>
          <span>If I get</span>
          <input 
            type="number" 
            className='score-input'
            min="0" 
            max="100"
            value={hypotheticalScore}
            onChange={(e) => {
              const val = e.target.value;
  // Разрешаем пустую строку (чтобы можно было стереть всё) или число от 0 до 100
  if (val === '' || (Number(val) >= 0 && Number(val) <= 100)) {
    setHypotheticalScore(val);
  }
             }}
            placeholder="Score"
          />
          <span>% on {isWaitingForRk2 ? 'RK2' : 'the exam'}...</span>
        </div>

        <div style={{ 
          padding: '10px', 
          borderRadius: '8px', 
          background: result ? '#f0f7ff' : 'transparent',
          border: result ? '1px solid #bae7ff' : 'none',
          minHeight: '60px' 
          
        }}>
          {!result ? (
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Enter a score to see how it affects your final grade and whether you'll reach your target.
            </p>
          ) : (
            <p style={{ margin: 0 }}>
              Your average will be <strong>{result.avg.toFixed(1)}%</strong>. 
              {result.avg >= targetPercent 
                ? " ✅ You will reach your target!" 
                : " ⚠️ You might miss your target."}
            </p>
          )}
        </div>
      </section>

      <section className="card" style={{ minHeight: '180px' }}>
        <h3>📊 Probability of Success</h3>
        <div style={{ background: '#eee', height: '12px', borderRadius: '6px', margin: '15px 0' }}>
          <div style={{ 
            width: `${probability}%`, 
            height: '100%', 
            background: probability > 70 ? '#4caf50' : probability > 40 ? '#ff9800' : '#f44336',
            borderRadius: '6px',
            transition: '0.5s'
          }} />
        </div>
        <p>Вероятность достижения цели: <strong>{probability.toFixed(0)}%</strong></p>
      </section>
    </div>
  );
};
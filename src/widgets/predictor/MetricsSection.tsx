export const MetricsSection = ({ subject, target }: { subject: any, target: number }) => {
  const rkAvg = (Number(subject.rk1) + Number(subject.rk2)) / 2;
  const currentTotal = (rkAvg * 0.6); // Уже заработано (60% от веса)
  
  // Рассчитываем, сколько % от итоговых 100 баллов нам нужно добрать до цели
  const targetPercent = target === 3 ? 50 : target === 4 ? 70 : 90;
  const neededFromExam = Math.max(0, (targetPercent - currentTotal) / 0.4);
  
  // Простая вероятность успеха (обратная от нужного балла на экзамене)
  const probability = Math.max(0, Math.min(100, 100 - neededFromExam));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
      {/* Блок Margin of Error (упрощенный) */}
      <section className="card">
        <h3>⚖️  Margin of Error</h3>
        <p>Чтобы достичь <strong>{target}</strong>, вам критически важно набрать на экзамене не менее <strong>{neededFromExam.toFixed(0)}%</strong>.</p>
        <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>* Любой балл ниже этого уровня переведет вас в категорию ниже.</p>
      </section>

      {/* Блок Probability */}
      <section className="card">
        <h3>📊  Probability of Success</h3>
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
export const PredictorWidget = ({ subject, target }: { subject: any, target: number }) => {
  const rkAvg = (Number(subject.rk1) + Number(subject.rk2)) / 2;
  const currentTotal = (rkAvg * 0.6); // Это то, что уже есть (60% от итоговой)

  // Пороги (диапазоны)
  const ranges: Record<number, { min: number, max: number }> = {
    3: { min: 50, max: 69 },
    4: { min: 70, max: 89 },
    5: { min: 90, max: 100 }
  };

  const getNeededScore = (targetPercent: number) => {
    const needed = (targetPercent - currentTotal) / 0.4;
    return Math.max(0, Math.min(100, needed)).toFixed(1);
  };

  const minNeeded = getNeededScore(ranges[target].min);
  const maxNeeded = getNeededScore(ranges[target].max);

  return (
    <section className="card" style={{ marginTop: '20px' }}>
      <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '16px' }}>
        <p>Для оценки <strong>{target}</strong> вам нужно набрать на экзамене:</p>
        <h2 style={{ color: 'var(--accent-primary)' }}>
          от {minNeeded}% до {maxNeeded}%
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          * При условии, что средний балл РК: {rkAvg.toFixed(1)}%
        </p>
      </div>
    </section>
  );
};
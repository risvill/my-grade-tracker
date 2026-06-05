export const SafetyNetWidget = ({ rk1, rk2, exam, target }: { rk1: any, rk2: any, exam: any, target: number }) => {
  const rk1Val = Number(rk1 ?? 0);
  const rk2Val = Number(rk2 ?? 0);
  
  const isWaitingForExam = rk1 !== null && rk2 !== null;
  const isWaitingForRk2 = rk1 !== null && rk2 === null;

  // Если таргет 3 — вообще ничего не показываем
  if (target === 3) return null;

  const calculate = (threshold: number) => {
    if (isWaitingForRk2) return (threshold * 2) - rk1Val;
    if (isWaitingForExam) {
      const rkAvg = (rk1Val + rk2Val) / 2;
      return (threshold - (rkAvg * 0.6)) / 0.4;
    }
    return null;
  };

  const renderBlock = (threshold: number, gradeLabel: string, description: string) => {
    const needed = calculate(threshold);
    if (needed === null || needed > 100) return null;


    // Блок, если цель уже достигнута (безопасная зона)
    if (needed <= 0) return (
        <div style={{ background: '#d4edda', padding: '15px', borderRadius: '12px', border: '1px solid #c3e6cb' }}>
            <p style={{ margin: 0, color: '#155724' }}>✅ Goal <strong>{gradeLabel}</strong> (min. {threshold}%) is already secured!</p>
        </div>
    );

    // Основной блок для расчета
    return (
      <div style={{ background: 'var(--bg-primary)', padding: '15px', borderRadius: '12px' }}>
        <p style={{ margin: 0 }}>
          To <strong>avoid grade {gradeLabel}</strong> ({description}): 
          you need to score at least <strong>{needed > 100 ? "impossible" : needed <= 0 ? "already secured" : `${needed.toFixed(1)}%`}</strong> on the {isWaitingForExam ? "exam" : "RK2"}.
        </p>
      </div>
    );
  };

  return (
    <section className="card" style={{ marginTop: '20px' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Таргет 4 и 5: показываем защиту от 2 */}
        {target >= 4 && renderBlock(50, '2', 'min. 50%')}
        
        {/* Только таргет 5: показываем защиту от 3 */}
        {target === 5 && renderBlock(70, '3', 'min. 70%')}
      </div>
    </section>
  );
};
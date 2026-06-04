export const SafetyNetWidget = ({ rkAverage, examWeight = 0.4 }: { rkAverage: number, examWeight?: number }) => {
  // Пороги (можешь менять их под свои требования)
  const THRESHOLD_2 = 50; 
  const THRESHOLD_3 = 70; 
  
  const calculateNeeded = (threshold: number) => {
    const needed = (threshold - (rkAverage * 0.6)) / examWeight;
    return Math.max(0, Math.min(100, needed)).toFixed(1);
  };

  const neededFor2 = calculateNeeded(THRESHOLD_2);
  const neededFor3 = calculateNeeded(THRESHOLD_3);
  

  return (
    <section className="card" style={{ marginTop: '20px' }}>
      <h3 style={{ marginBottom: '15px' }}>🛡️ Safety Net</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Блок для 2 */}
        <div style={{ background: 'var(--bg-primary)', padding: '15px', borderRadius: '12px' }}>
          <p style={{ margin: 0 }}>
            Чтобы <strong>не получить 2</strong>: нужно набрать <strong>{neededFor2}%</strong> на экзамене.
          </p>
        </div>

        {/* Блок для 3 */}
        <div style={{ background: 'var(--bg-primary)', padding: '15px', borderRadius: '12px' }}>
          <p style={{ margin: 0 }}>
            Чтобы <strong>не получить 3</strong> (выйти на 4): нужно набрать <strong>{neededFor3}%</strong> на экзамене.
          </p>
        </div>
      </div>
    </section>
  );
};
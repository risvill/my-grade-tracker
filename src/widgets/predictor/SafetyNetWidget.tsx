export const SafetyNetWidget = ({ rkAverage, examWeight = 0.4 }: { rkAverage: number, examWeight?: number }) => {
  // Пороги: 50% - это "двойка" (минимальный проходной), 70% - это "тройка" (порог четверки)
  const MIN_FOR_PASS = 50; 
  const MIN_FOR_FOUR = 70; 
  
  const calculateNeeded = (threshold: number) => {
    // Формула: (Порог - (Среднее РК * 0.6)) / 0.4
    const needed = (threshold - (rkAverage * 0.6)) / examWeight;
    // Ограничиваем от 0 до 100
    return Math.max(0, Math.min(100, needed)).toFixed(1);
  };

  const scoreForPass = calculateNeeded(MIN_FOR_PASS); // Чтобы не получить 2
  const scoreForFour = calculateNeeded(MIN_FOR_FOUR); // Чтобы не получить 3 (выйти на 4)

  return (
    <section className="card" style={{ marginTop: '20px' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Блок: Как избежать 2 */}
        <div style={{ background: 'var(--bg-primary)', padding: '15px', borderRadius: '12px' }}>
          <p style={{ margin: 0 }}>
            Чтобы <strong>избежать оценки 2</strong> (минимум 50%): 
            нужно набрать <strong>{scoreForPass}%</strong> на экзамене.
          </p>
        </div>

        {/* Блок: Как избежать 3 */}
        <div style={{ background: 'var(--bg-primary)', padding: '15px', borderRadius: '12px' }}>
          <p style={{ margin: 0 }}>
            Чтобы <strong>избежать оценки 3</strong> (выйти на 4, минимум 70%): 
            нужно набрать <strong>{scoreForFour}%</strong> на экзамене.
          </p>
        </div>
      </div>
    </section>
  );
};
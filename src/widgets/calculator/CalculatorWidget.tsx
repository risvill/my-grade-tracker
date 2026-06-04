import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom'; // Импортируем хук контекста
import { supabase } from '../../lib/supabaseClient';

export const CalculatorWidget = () => {
  // Получаем состояние истории из MainLayout
  const { isHistoryOpen, setIsHistoryOpen } = useOutletContext<{ 
    isHistoryOpen: boolean, 
    setIsHistoryOpen: (val: boolean) => void 
  }>();

  const [rk1, setRk1] = useState('');
  const [rk2, setRk2] = useState('');
  const [exam, setExam] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [faGrades, setFaGrades] = useState<string[]>([]);
  const [currentFa, setCurrentFa] = useState('');

  const total = ((Number(rk1) + Number(rk2)) / 2) * 0.6 + Number(exam) * 0.4;

  const fetchHistory = async () => {
    const { data } = await supabase.from('grades').select('*');
    if (data) setHistory(data);
  };

  useEffect(() => { 
    fetchHistory(); 
  }, []);

  const handleSave = async () => {
    const subjectName = prompt("Название предмета:");
    if (!subjectName) return;

    const { error } = await supabase.from('grades').insert([{ 
      title: subjectName, 
      rk1, 
      rk2, 
      exam, 
      total_percent: total.toFixed(1),
      fa_grades: faGrades 
    }]);
    
    if (error) alert('Ошибка: ' + error.message);
    else {
      alert('Сохранено!');
      fetchHistory();
    }
  };

  const loadIntoCalculator = (item: any) => {
    setRk1(item.rk1?.toString() || '');
    setRk2(item.rk2?.toString() || '');
    setExam(item.exam?.toString() || '');
    setFaGrades(item.fa_grades || []); 
    setIsHistoryOpen(false); // Закрываем историю через функцию из контекста
  };

  return (
    <div id="wrapper">
      {/* Кнопку "История" из виджета УДАЛИЛИ, она теперь в Navbar */}

      <main className="layout" style={{ marginTop: '40px' }}>
        <section style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: '20px', boxShadow: 'var(--card-shadow)', marginBottom: '30px' }}>
          <p style={{ color: 'var(--text-muted)' }}>Total Percent</p>
          <h2 style={{ fontSize: '48px', margin: '10px 0' }}>{isNaN(total) ? 0 : total.toFixed(1)}%</h2>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
          <section style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: '20px', border: '1px solid var(--border-primary)' }}>
            <h3 style={{ marginBottom: '20px' }}>Summative Assessments</h3>
            <input className="input-field" type="number" placeholder="РК-1" value={rk1} onChange={(e) => setRk1(e.target.value)} />
            <input className="input-field" type="number" placeholder="РК-2" value={rk2} onChange={(e) => setRk2(e.target.value)} />
            <input className="input-field" type="number" placeholder="Экзамен" value={exam} onChange={(e) => setExam(e.target.value)} />
            <button onClick={handleSave} style={{ width: '100%', padding: '15px', background: 'var(--accent-primary)', color: 'white', borderRadius: '12px', border: 'none', marginTop: '20px', cursor: 'pointer' }}>
              Save Result
            </button>
          </section>

          <section style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: '20px', border: '1px solid var(--border-primary)' }}>
            <h3 style={{ marginBottom: '20px' }}>Formative Assessment (FA)</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
              {faGrades.map((g, i) => (
                <span key={i} style={{ background: 'var(--accent-secondary)', color: 'var(--accent-primary)', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold' }}>
                  {g}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                className="input-field" 
                placeholder="New grade..." 
                value={currentFa} 
                onChange={(e) => setCurrentFa(e.target.value)} 
                style={{ marginBottom: 0 }}
              />
              <button onClick={() => { if(currentFa) setFaGrades([...faGrades, currentFa]); setCurrentFa(''); }} style={{ padding: '0 20px', background: 'var(--accent-primary)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                +
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* История теперь управляется через isHistoryOpen из контекста */}
      <div 
        className={`history-sidebar ${isHistoryOpen ? 'open' : ''}`} 
        style={{ position: 'fixed', right: isHistoryOpen ? '0' : '-400px', top: 0, width: '400px', height: '100%', background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-primary)', padding: '20px', transition: '0.3s', zIndex: 100 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3>Calculation History</h3>
          <button onClick={() => setIsHistoryOpen(false)}>✕</button>
        </div>
        {history.map(item => (
          <div key={item.id} onClick={() => loadIntoCalculator(item)} style={{ padding: '15px', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span>{item.title}</span>
            <strong>{item.total_percent}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
};
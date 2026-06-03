import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import './styles/globals.scss'; 

export default function App() {
  const [rk1, setRk1] = useState('');
  const [rk2, setRk2] = useState('');
  const [exam, setExam] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [faGrades, setFaGrades] = useState<string[]>([]);
const [currentFa, setCurrentFa] = useState(''); // Для ввода новой оценки в список

  const total = ((Number(rk1) + Number(rk2)) / 2) * 0.6 + Number(exam) * 0.4;

  const fetchHistory = async () => {
    const { data } = await supabase.from('grades').select('*');
    if (data) setHistory(data);
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleSave = async () => {
  const subjectName = prompt("Название предмета:");
  if (!subjectName) return;

  const { error } = await supabase.from('grades').insert([{ 
    title: subjectName, 
    rk1, 
    rk2, 
    exam, 
    total_percent: total.toFixed(1),
    fa_grades: faGrades // Сохраняем массив текущих оценок
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
  // Загружаем сохраненный массив FA или пустой массив, если его нет
  setFaGrades(item.fa_grades || []); 
  setIsHistoryOpen(false);
};

  return (
    <div id="wrapper">
      {/* Навигация */}
      <header style={{ padding: '20px 0', borderBottom: '1px solid var(--border-primary)' }}>
        <div className="layout" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: 'var(--accent-primary)', fontSize: '24px' }}>GradeMaster</h1>
          <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)} 
            style={{ cursor: 'pointer', background: 'var(--accent-secondary)', padding: '8px 16px', borderRadius: '8px', border: 'none', color: 'var(--accent-primary)' }}
          >
            История
          </button>
        </div>
      </header>

      <main className="layout" style={{ marginTop: '40px' }}>
  {/* 1. Блок Total Percent (на всю ширину) */}
  <section style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: '20px', boxShadow: 'var(--card-shadow)', marginBottom: '30px' }}>
    <p style={{ color: 'var(--text-muted)' }}>Total Percent</p>
    <h2 style={{ fontSize: '48px', margin: '10px 0' }}>{isNaN(total) ? 0 : total.toFixed(1)}%</h2>
  </section>

  {/* 2. Сетка: Слева - Калькулятор, Справа - FA Grades */}
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
    
    {/* Основной калькулятор */}
    <section style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: '20px', border: '1px solid var(--border-primary)' }}>
      <h3 style={{ marginBottom: '20px' }}>Summative Assessments</h3>
      <input className="input-field" type="number" placeholder="РК-1" value={rk1} onChange={(e) => setRk1(e.target.value)} />
      <input className="input-field" type="number" placeholder="РК-2" value={rk2} onChange={(e) => setRk2(e.target.value)} />
      <input className="input-field" type="number" placeholder="Экзамен" value={exam} onChange={(e) => setExam(e.target.value)} />
      <button onClick={handleSave} style={{ width: '100%', padding: '15px', background: 'var(--accent-primary)', color: 'white', borderRadius: '12px', border: 'none', marginTop: '20px', cursor: 'pointer' }}>
        Save Result
      </button>
    </section>

    {/* FA Grades (как на скриншоте) */}
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

      {/* Боковая панель истории */}
      <div 
        className={`history-sidebar ${isHistoryOpen ? 'open' : ''}`} 
        style={{ position: 'fixed', right: isHistoryOpen ? '0' : '-400px', top: 0, width: '400px', height: '100%', background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-primary)', padding: '20px', transition: '0.3s', zIndex: 100 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3>Calculation History</h3>
          <button onClick={() => setIsHistoryOpen(false)}>✕</button>
        </div>
        {history.map(item => (
  <div 
    key={item.id} 
    onClick={() => loadIntoCalculator(item)} 
    style={{ 
      padding: '15px', 
      borderBottom: '1px solid var(--border-primary)', 
      display: 'flex', 
      justifyContent: 'space-between',
      cursor: 'pointer' // Добавили курсор, чтобы было понятно, что кликабельно
    }}
  >
    <span>{item.title}</span>
    <strong>{item.total_percent}%</strong>
  </div>
))}
      </div>
    </div>
  );

}

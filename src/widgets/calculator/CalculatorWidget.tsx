import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export const CalculatorWidget = () => {
  // 1. Берем состояние из контекста, чтобы Navbar и виджет "дружили"
  const { isHistoryOpen, setIsHistoryOpen } = useOutletContext<any>();

  const [rk1, setRk1] = useState('');
  const [rk2, setRk2] = useState('');
  const [exam, setExam] = useState('');
  const [history, setHistory] = useState<any[]>([]);
const [faGrades, setFaGrades] = useState<{ id: number; value: string }[]>([]);
  const [currentFa, setCurrentFa] = useState('');

const [targetId, setTargetId] = useState<number | null>(null);
const [saveStatus, setSaveStatus] = useState<'idle' | 'input' | 'confirming' | 'success'>('idle');
const [newSubjectName, setNewSubjectName] = useState(''); // Для ввода имени
const [pendingName, setPendingName] = useState(''); // Имя, которое уже есть в базе

const [selectedFaIds, setSelectedFaIds] = useState<number[]>([]); // ID выбранных оценок
const [isSelectionMode, setIsSelectionMode] = useState(false); // Включен ли режим выбора

const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const total = ((Number(rk1) + Number(rk2)) / 2) * 0.6 + Number(exam) * 0.4;

  const fetchHistory = async () => {
    const { data } = await supabase.from('grades').select('*');
    if (data) setHistory(data);
  };

  useEffect(() => { 
    fetchHistory(); 
  }, []);


const handlePressStart = (id: number) => {
  const timeout = setTimeout(() => {
    toggleSelection(id); // Выбираем элемент через 500мс
  }, 300);
  setTimer(timeout);
};

// Функция завершения нажатия
const handlePressEnd = () => {
  if (timer) {
    clearTimeout(timer);
    setTimer(null);
  }
};

const toggleSelection = (id: number) => {
  if (selectedFaIds.includes(id)) {
    // Убираем из выбора
    const newSelection = selectedFaIds.filter(selectedId => selectedId !== id);
    setSelectedFaIds(newSelection);
    if (newSelection.length === 0) setIsSelectionMode(false);
  } else {
    // Добавляем в выбор
    setSelectedFaIds([...selectedFaIds, id]);
    setIsSelectionMode(true);
  }
};

const handleReset = () => {
  setRk1('');
  setRk2('');
  setExam('');
  setFaGrades([]);
  setNewSubjectName('');
  setSaveStatus('idle');
};

const handleCheckExistence = async () => {
  const { data } = await supabase.from('grades').select('id').eq('title', newSubjectName);
  if (data && data.length > 0) {
    setPendingName(newSubjectName);
    setTargetId(data[0].id);
    setSaveStatus('confirming');
  } else {
    await insertNewRecord(newSubjectName);
    finishSave();
  }
};

const finishSave = () => {
  setSaveStatus('success');
  fetchHistory();
  setTimeout(() => {
    setSaveStatus('idle');
    setNewSubjectName('');
  }, 2000); // Скрываем сообщение через 2 секунды
};


const insertNewRecord = async (baseName: string) => {
  let finalName = baseName;
  let counter = 2;

  // Цикл: пока имя занято, пробуем добавить цифру
  while (true) {
    const { data } = await supabase
      .from('grades')
      .select('id')
      .eq('title', finalName);

    if (data && data.length > 0) {
      // Имя занято, пробуем следующее (например, "Sabr 3")
      finalName = `${baseName} ${counter}`;
      counter++;
    } else {
      // Имя свободно, выходим из цикла
      break;
    }
  }

  // Теперь вставляем запись с найденным свободным именем
  const { error } = await supabase.from('grades').insert([{ 
    title: finalName, 
    rk1, rk2, exam, 
    total_percent: total.toFixed(1) 
  }]);
  
  if (error) {
    alert('Ошибка: ' + error.message);
  } else {
    finishSave();
  }
};

 const handleUpdate = async () => {
    if (targetId) {
      await supabase.from('grades').update({ rk1, rk2, exam, total_percent: total.toFixed(1) }).eq('id', targetId);
      finishSave();
    }
  };

  const loadIntoCalculator = (item: any) => {
    setRk1(item.rk1?.toString() || '');
    setRk2(item.rk2?.toString() || '');
    setExam(item.exam?.toString() || '');
    setFaGrades(item.fa_grades || []); 
    
    // Закрываем историю через контекст
    if (setIsHistoryOpen) setIsHistoryOpen(false);
  };

  return (
    <div id="wrapper">
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
            <div style={{ marginTop: '20px', padding: '20px', background: '#f9f9f9', borderRadius: '12px' }}>
              {saveStatus === 'idle' && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => setSaveStatus('input')} 
                    style={{ flex: 2, padding: '15px', background: 'var(--accent-primary)', color: 'white', borderRadius: '12px', border: 'none', cursor: 'pointer' }}
                  >
                    Save Result
                  </button>
                  <button 
                    onClick={handleReset} 
                    style={{ flex: 1, padding: '15px', background: 'var(--bg-secondary)', color: 'var(--text-muted)', borderRadius: '12px', border: '1px solid var(--border-primary)', cursor: 'pointer' }}
                  >
                    Reset
                  </button>
                </div>
              )}

            {saveStatus === 'input' && (
              <div>
                <input 
                  placeholder="Введите название..." 
                  value={newSubjectName} 
                  onChange={(e) => setNewSubjectName(e.target.value)} 
                />
                <button onClick={handleCheckExistence}>Проверить</button>
              </div>
            )}

            {saveStatus === 'confirming' && (
              <div>
                      <p>Предмет <strong>{pendingName}</strong> уже есть. Обновить?</p>
                      <button onClick={handleUpdate}>Обновить</button>
                      <button onClick={() => insertNewRecord(pendingName)}>Создать новый</button>
                    </div>
            )}

            {saveStatus === 'success' && (
              <div style={{ color: 'green', fontWeight: 'bold' }}>
                ✅ Успешно сохранено!
              </div>
            )}
          </div>
          </section>

          <section style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: '20px', border: '1px solid var(--border-primary)' }}>
            <h3 style={{ marginBottom: '20px' }}>Formative Assessment (FA)</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
              {faGrades.map((grade) => (
  <div 
    key={grade.id}
    // Старт таймера при нажатии (и мыши, и таче)
    onMouseDown={() => handlePressStart(grade.id)}
    onMouseUp={handlePressEnd}
    onMouseLeave={handlePressEnd} // Если ушли курсором с кнопки, отменяем
    
    // Для мобильных устройств:
    onTouchStart={() => handlePressStart(grade.id)}
    onTouchEnd={handlePressEnd}
    
    style={{
      padding: '10px',
      border: selectedFaIds.includes(grade.id) ? '2px solid var(--accent-primary)' : '1px solid #ccc',
      backgroundColor: selectedFaIds.includes(grade.id) ? '#e6f0ff' : 'white',
      cursor: 'pointer',
      borderRadius: '8px',
      userSelect: 'none' // Чтобы текст не выделялся при удержании
    }}
  >
    {grade.value}
  </div>
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
              <button onClick={() => { if(currentFa) setFaGrades([...faGrades, { id: Date.now(), value: currentFa }]); setCurrentFa(''); }} style={{ padding: '0 20px', background: 'var(--accent-primary)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                +
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Вынос истории за пределы MainLayout (если нужно) или управление через контекст */}
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
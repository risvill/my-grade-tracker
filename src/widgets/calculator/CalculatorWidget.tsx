import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { getGradeInfo } from '../../utils/gradeConverter';

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
const [editingId, setEditingId] = useState<number | null>(null);

const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
const total = ((Number(rk1) + Number(rk2)) / 2) * 0.6 + Number(exam) * 0.4;
const gradeInfo = getGradeInfo(total);

const deleteHistoryItem = async (id: number) => {
  // 1. Удаляем из базы
  const { error } = await supabase
    .from('grades')
    .delete()
    .eq('id', id);

  if (!error) {
    // 2. Если удаление успешно — обновляем стейт в React
    setHistory(history.filter(item => item.id !== id));
  } else {
    console.error("Ошибка удаления из БД:", error);
  }
};



  const fetchHistory = async () => {
    const { data } = await supabase.from('grades').select('*');
    if (data) setHistory(data);
  };

  useEffect(() => { 
    fetchHistory(); 
  }, []);

const handleRename = async (id: string) => {
  const newName = prompt("Введите новое название:");
  if (!newName) return;

  const { data, error } = await supabase
    .from('grades')
    .update({ title: newName }) // <-- ЗАМЕНИ 'name' НА ТОЧНОЕ ИМЯ КОЛОНКИ ИЗ БАЗЫ
    .eq('id', id);

  if (error) {
    console.error("Ошибка обновления:", error.message);
    console.error("Детали:", error.details); // Это покажет, почему Bad Request
    alert(`Ошибка: ${error.message}`);
  } else {
    setHistory(prev => prev.map(item => item.id === id ? { ...item, title: newName } : item));
  }
};
const handleDeleteSelected = () => {
  setFaGrades(faGrades.filter(g => !selectedFaIds.includes(g.id)));
  setSelectedFaIds([]); // Сбрасываем выбор
  setIsSelectionMode(false);
};

const handleEditSelected = () => {
  const item = faGrades.find(g => g.id === selectedFaIds[0]);
  if (item) {
    setCurrentFa(item.value); // Кладем значение в поле ввода (инпут)
    setEditingId(item.id);    // Запоминаем, какую карточку правим
    setSelectedFaIds([]);     // Скрываем панель кнопок
    setIsSelectionMode(false);
  }
};


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
    fa_grades: faGrades,
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
      await supabase.from('grades').update({ rk1, rk2, exam, fa_grades: faGrades, total_percent: total.toFixed(1) }).eq('id', targetId);
      finishSave();
    }
  };

  const loadIntoCalculator = (item: any) => {
    setRk1(item.rk1?.toString() || '');
    setRk2(item.rk2?.toString() || '');
    setExam(item.exam?.toString() || '');
    setFaGrades(item.fa_grades || []);
    setNewSubjectName(item.title);
    setSaveStatus('idle'); // Возвращаем в обычный режим
    
    // Закрываем историю через контекст
    if (setIsHistoryOpen) setIsHistoryOpen(false);
  };

  return (
    <div id="wrapper">
      <main className="layout" style={{ marginTop: '40px' }}>
        <section style={{ 
          background: 'var(--bg-secondary)', 
          padding: '30px', 
          borderRadius: '20px', 
          boxShadow: 'var(--card-shadow)', 
          marginBottom: '30px' 
        }}>
          {/* Красивая карточка с GPA и прогресс-баром */}
          <div style={{ 
            background: '#fff',
            borderRadius: '16px', 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#666', fontSize: '14px' }}>Total Percent</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '5px 0' }}>
                  {isNaN(total) ? '0.0' : total.toFixed(1)}%
                </div>
                <div style={{ color: '#4a5568', fontSize: '16px' }}>
                  GPA: {gradeInfo.gpa} ({gradeInfo.letter})
                </div>
              </div>
              
              {/* Квадратик с оценкой */}
              <div style={{ 
                background: '#38a169', 
                color: 'white', 
                padding: '10px 18px', 
                borderRadius: '12px', 
                fontWeight: 'bold',
                fontSize: '20px'
              }}>
                {gradeInfo.letter === 'A' || gradeInfo.letter === 'A-' ? '5' : 
                gradeInfo.letter.startsWith('B') ? '4' : 
                gradeInfo.letter.startsWith('C') ? '3' : '2'}
              </div>
            </div>
            
            {/* Прогресс бар */}
            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', marginTop: '20px' }}>
              <div style={{ 
                width: `${Math.min(Math.max(total, 0), 100)}%`, 
                height: '100%', 
                background: '#38a169', 
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }} />
            </div>
            
            <div style={{ textAlign: 'right', marginTop: '8px', fontSize: '12px', color: '#718096' }}>
              {gradeInfo.label}
            </div>
          </div>
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

          {/* Панель действий */}
          {selectedFaIds.length > 0 && (
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              marginBottom: '15px', 
              padding: '10px', 
              background: '#f0f0f0', 
              borderRadius: '8px' 
            }}>
              <button onClick={handleDeleteSelected}>
                Удалить ({selectedFaIds.length})
              </button>
              
              {/* Кнопка "Изменить" доступна только если выбрана ровно одна оценка */}
              {selectedFaIds.length === 1 && (
                <button onClick={handleEditSelected}>
                  Изменить
                </button>
              )}
              
              <button onClick={() => { setSelectedFaIds([]); setIsSelectionMode(false); }}>
                Отмена
              </button>
            </div>
          )}

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
            {editingId && (
              <div style={{ color: 'var(--accent-primary)', marginBottom: '5px' }}>
                Редактирование оценки... 
                <span onClick={() => { setEditingId(null); setCurrentFa(''); }} style={{cursor: 'pointer'}}> (Отмена)</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                className="input-field" 
                placeholder="New grade..." 
                value={currentFa} 
                onChange={(e) => setCurrentFa(e.target.value)} 
                style={{ marginBottom: 0 }}
              />
              <button onClick={() => {
                if (!currentFa) return;

                if (editingId) {
                  // Если мы в режиме редактирования — обновляем существующую
                  setFaGrades(faGrades.map(g => 
                    g.id === editingId ? { ...g, value: currentFa } : g
                  ));
                  setEditingId(null); // Выходим из режима редактирования
                } else {
                  // Если просто добавляем новую
                  setFaGrades([...faGrades, { id: Date.now(), value: currentFa }]);
                }
                
                setCurrentFa(''); // Очищаем инпут
              }}>
                {editingId ? 'Сохранить' : 'Добавить'}
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
          <h3>Calculation History</h3>
            <div className={`history-sidebar ${isHistoryOpen ? 'open' : ''}`} 
              style={{ position: 'fixed', right: isHistoryOpen ? '0' : '-400px', top: 0, width: '400px', height: '100%', background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-primary)', padding: '20px', transition: '0.3s', zIndex: 100 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Calculation History</h3>
                <button onClick={() => setIsHistoryOpen(false)} style={{ cursor: 'pointer' }}>✕</button>
              </div>

              <div style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto', marginTop: '20px' }}>
                {history.map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                    
                    {/* Редактирование названия */}
                    <span 
                      onClick={() => handleRename(item.id)} 
                      style={{ cursor: 'text', fontWeight: '500' }}
                    >
                      {item.title || "Без названия"}
                    </span>

                    {/* Загрузка в калькулятор */}
                    <span 
                      onClick={() => loadIntoCalculator(item)} 
                      style={{ flexGrow: 1, cursor: 'pointer', fontWeight: 'bold', marginRight: '15px' }}
                    >
                      {item.total_percent}%
                    </span>

                    {/* Кнопка удаления */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteHistoryItem(item.id); }} 
                      style={{ cursor: 'pointer', border: 'none', background: 'none', fontSize: '18px', color: '#ff4d4f' }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
    </div>
      </div>
  );
};
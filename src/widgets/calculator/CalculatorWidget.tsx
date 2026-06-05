import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { getGradeInfo } from '../../utils/gradeConverter';
import { Pencil, Trash2, ArrowLeft, History, } from 'lucide-react';

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

const getBackgroundColor = (letter: string) => {
  if (letter === 'A' || letter === 'A-') return '#38a169'; // Зеленый (5)
  if (letter.startsWith('B')) return '#dd6b20';            // Оранжевый (4)
  if (letter.startsWith('C')) return '#e53e3e';            // Красный (3)
  return '#c05621';                                        // Темно-оранжевый (2)
};

// ... внутри твоего компонента:
const backgroundColor = getBackgroundColor(gradeInfo.letter);



const togglePin = async (id: string) => {
  // 1. Находим элемент в текущем списке, чтобы знать его текущее состояние
  const item = history.find(i => i.id === id);
  if (!item) return;

  const newPinnedStatus = !item.is_pinned; // Используем имя колонки из БД

  // 2. Делаем запрос к таблице 'grades'
  const { error } = await supabase
    .from('grades') 
    .update({ is_pinned: newPinnedStatus }) 
    .eq('id', id);

  if (error) {
    console.error("Ошибка при обновлении статуса закрепления:", error);
    return;
  }

  // 3. Обновляем локальный стейт, чтобы UI перерисовался мгновенно
  setHistory(prevHistory => 
  prevHistory.map(i => 
    i.id === id ? { ...i, is_pinned: newPinnedStatus } : i
  )
);
};

const getScoreColor = (score: any) => {
  const num = Number(score);
  if (!score || num < 50) return '#e53e3e'; // Красный (ниже 50 или пусто)
  if (num >= 50 && num <= 69) return '#e53e3e'; // Красный (50-69)
  if (num >= 70 && num <= 89) return '#d69e2e'; // Оранжевый (70-89)
  return '#38a169'; // Зеленый (90-100)
};

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

const finishSave = () => {
  setSaveStatus('success');
  fetchHistory();
  setTimeout(() => {
    setSaveStatus('idle');
    setNewSubjectName('');
  }, 2000); // Скрываем сообщение через 2 секунды
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
  const newRecord = {
    title: finalName,
    rk1: Number(rk1),           // Убедись, что это числа
    rk2: Number(rk2),
    exam: Number(exam),
    fa_grades: faGrades,        // Убедись, что тип соответствует колонке в БД
    total_percent: parseFloat(total.toFixed(1)), // Преобразуем строку обратно в число
    is_pinned: false            // Добавь, если эта колонка обязательна
  };

  const { error } = await supabase.from('grades').insert([newRecord]);
  
  if (error) {
    console.error("Ошибка Supabase:", error);
    alert('Ошибка при сохранении: ' + error.message);
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
      <main className="layout" >
        <section style={{ 
          background: 'var(--bg-secondary)', 
          padding: '30px', 
          margin: '0 auto',
          borderRadius: '20px', 
          width:'100%',
          maxWidth: '850px',
          boxShadow: 'var(--card-shadow)', 
          marginBottom: '24px' 
        }}>
          {/* Красивая карточка с GPA и прогресс-баром */}
          <div style={{ 
            background: '#fff',
            borderRadius: '16px', 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#666', fontSize: '18px', fontWeight: '700' }}>Total Percent</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '5px 0' }}>
                  {isNaN(total) ? '0.0' : total.toFixed(1)}%
                </div>
                <div style={{ color: '#4a5568', fontSize: '16px' }}>
                  GPA: {gradeInfo.gpa} ({gradeInfo.letter})
                </div>
              </div>
              
              {/* Квадратик с оценкой */}
              <div style={{ 
                background: backgroundColor, // Цвет готов!
                color: 'white', 
                padding: '10px 18px', 
                borderRadius: '12px', 
                fontWeight: 'bold',
                fontSize: '20px'
              }}>
                {/* Здесь выводишь то, что нужно (цифру или букву) */}
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
                background: backgroundColor, 
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }} />
            </div>
            
            <div style={{ textAlign: 'right', marginTop: '8px', fontSize: '12px', color: '#718096' }}>
              {gradeInfo.label}
            </div>
          </div>
        </section>
          <section style={{ 
            background: '#ffffff', 
            padding: '30px', 
            borderRadius: '20px', 
            width: '100%', 
            maxWidth: '850px', 
            margin: '0 auto 24px auto', 
            border: '1px solid #e2e8f0',
            boxShadow: 'var(--card-shadow)', 
          }}>
            <div style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700', color: '#666' }}>
              Summative Assessments
            </div>

            {/* РК-1 и РК-2 в одну линию */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* РК-1 */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#475569' }}>RK-1</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <input 
                    type="number" 
                    className="score-input" // твой класс из global.scss для формы и фокуса
                    value={rk1} 
                    onChange={(e) => setRk1(e.target.value)}
                    placeholder="Score"
                    style={{ 
                      // Динамически меняем рамку в зависимости от значения
                      borderColor: getScoreColor(rk1),
                      // Дополнительно: если хочешь, чтобы при наборе цвет текста тоже менялся:
                    }}
                  />
                  <span style={{ color: '#94a3b8' }}>/</span>
                  <input 
                    type="text" 
                    value="100" 
                    disabled 
                    style={{fontSize: '16px', width: '70px', padding: '8px', borderRadius: '12px', border: '2px solid #cbd5e0', textAlign: 'center', background: '#f1f5f9', color: '#64748b' }} 
                  />
                </div>
              </div>

              {/* РК-2 (по аналогии) */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#475569' }}>RK-2</h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <input 
                    type="number" 
                    className="score-input" // твой класс из global.scss для формы и фокуса
                    value={rk2} 
                    onChange={(e) => setRk2(e.target.value)}
                    placeholder="Score"
                    style={{ 
                      // Динамически меняем рамку в зависимости от значения
                      borderColor: getScoreColor(rk2),
                      // Дополнительно: если хочешь, чтобы при наборе цвет текста тоже менялся:
                    }}
                  />
                  <span style={{ color: '#94a3b8' }}>/</span>
                  <input 
                    type="text" 
                    value="100" 
                    disabled 
                    style={{fontSize: '16px', width: '70px', padding: '8px', borderRadius: '12px', border: '2px solid #cbd5e0', textAlign: 'center', background: '#f1f5f9', color: '#64748b' }} 
                  />
                </div>
              </div>
            </div>

            </section>
               <div style={{ 
                  display: 'flex',           // Используем flex вместо grid
                  justifyContent: 'center',  // Прижимаем всё к центру
                  alignItems: 'flex-start',  // Выравниваем по верхнему краю
                  gap: '20px',               // Расстояние между блоками (уменьши до 10px, если хочешь еще ближе)
                  width: '100%',
                  maxWidth: '1200px',        // Ограничиваем общую ширину, чтобы не разлетались
                  margin: '0 auto',
                  marginBottom: '24px'          // Центрируем сам контейнер на странице
                }}>
                  <div style={{ flex: '1', maxWidth: '600px' }}>
                  <section style={{ height: '257.5px' ,background: 'var(--bg-secondary)',boxShadow: 'var(--card-shadow)',  padding: '30px', borderRadius: '20px', border: '1px solid var(--border-primary)', width:'100%', maxWidth: '585px' }}>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <h3 style={{ flex: '1', margin: '8px' ,fontSize: '17px', fontWeight: '700', color: '#666' }}>Formative Assessment (FA)</h3>
                      
                      {selectedFaIds.length > 0 && (
                        <div   
                          key="action-panel" 
                          className="animate-appear" style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          margin: '0',
                          padding: '0px 5px 0px 5px',
                        }}>
                          {/* Кнопка Удалить */}
                          <button 
                            onClick={handleDeleteSelected} 
                            style={{ padding: '8px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#ef4444' }}
                          >
                            <Trash2 size={20} />
                          </button>
                          
                          {/* Кнопка Редактировать (только если выбрана одна) */}
                          {selectedFaIds.length === 1 && (
                            <button 
                              onClick={handleEditSelected} 
                              style={{ padding: '8px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#3b82f6' }}
                            >
                              <Pencil size={20} />
                            </button>
                          )}

                          {/* Кнопка Назад (Отмена) */}
                          <button 
                            onClick={() => { setSelectedFaIds([]); setIsSelectionMode(false); }}
                            style={{ padding: '8px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748b' }}
                          >
                            <ArrowLeft size={20} />
                          </button>
                        </div>
                      )}
                      {editingId && (
                      <div style={{ color: '#3075e6', marginBottom: '10px', fontSize: '14px', margin: '0',
                          padding: '10px 5px 0px 5px', }}>
                        Editing...
                        <span onClick={() => { setEditingId(null); setCurrentFa(''); }} style={{  padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer' , textDecoration: 'none', marginLeft: '15px' }}>
                          Cancel
                        </span>
                      </div>
                    )}
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px', marginBottom: '0px'}}>
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
                            padding: '8px 16px',
                            border: selectedFaIds.includes(grade.id) ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                            backgroundColor: selectedFaIds.includes(grade.id) ?  '#3b82f6' : 'white',
                            boxShadow: selectedFaIds.includes(grade.id) ?  '-2px 0 10px #94bdff' : '1px 0 0 white',
                            borderRadius: '12px',       // Скругление как на скриншоте
                            display: 'flex',
                            alignItems: 'center',
                            maxWidth: '60px',
                            maxHeight: '36px',
                            marginBottom: '20px'
                          }}
                        >
                          <span style={{ fontWeight: '600', fontSize: '15px', color: selectedFaIds.includes(grade.id) ?  'white' : 'black'}}>{grade.value}</span>
                        </div>
                      ))}
                    </div>
                    
                  <div style={{ display: 'flex', gap: '10px',}}>
                <input 
                  className="score-input" 

                  value={currentFa} 
                  onChange={(e) => setCurrentFa(e.target.value)} 
                  style={{ flex: 1, marginBottom: 0, maxWidth: '100px' }}
                />
                <button 
                  onClick={() => {
                    if (!currentFa) return;
                    if (editingId) {
                      setFaGrades(faGrades.map(g => g.id === editingId ? { ...g, value: currentFa } : g));
                      setEditingId(null);
                    } else {
                      setFaGrades([...faGrades, { id: Date.now(), value: currentFa }]);
                    }
                    setCurrentFa('');
                  }}
                  style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: '600' }}
                >
                  {editingId ? 'Update' : 'Add'}
                </button>
              </div>
          </section>
          </div>

            <section style={{ 
                background: '#ffffff', 
                padding: '20px', 
                width: '100%' ,
                maxWidth: '220px',
                borderRadius: '20px', 
                border: '1px solid #e2e8f0',
                flexShrink: 0,
                height: '257.5px',
                boxShadow: 'var(--card-shadow)', 
              }}>
                <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: '700', color: '#666' }}>Summative Assessment for Quarter</h3>
                <div style={{ display: 'flex', padding: '10px',alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <input 
                    type="number" 
                    className="score-input" // твой класс из global.scss для формы и фокуса
                    value={exam} 
                    onChange={(e) => setExam(e.target.value)}
                    placeholder="Score"
                    style={{ 
                      // Динамически меняем рамку в зависимости от значения
                      borderColor: getScoreColor(rk1),
                      // Дополнительно: если хочешь, чтобы при наборе цвет текста тоже менялся:
                    }}
                  />
                  <span style={{ color: '#a3aebe' }}>/</span>
                  <input 
                    type="text" 
                    value="100" 
                    disabled 
                    style={{fontSize: '16px', width: '70px', padding: '8px', borderRadius: '12px', border: '2px solid #cad5e2', textAlign: 'center', background: '#fafdff', color: '#8f9db1' }} 
                  />
                </div>
             </section>
          </div>

          
              {/* Режим выбора: Сохранить или Сбросить */}
              {saveStatus === 'idle' && (
                <div style={{ display: 'flex', gap: '12px', margin: '0 auto 20px', 
                  width: '100%', 
                  maxWidth: '850px',
                  height: '42px' }}>
                  <button 
                    onClick={() => setSaveStatus('input')} 
                    style={{ 
                      flex: 2, padding: '10px', background: '#3b82f6', color: 'white', 
                      borderRadius: '16px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '600' 
                    }}
                  >
                    Save Result
                  </button>
                  <button 
                    onClick={handleReset} 
                    style={{ 
                      flex: 1, background: '#ffffff', color: '#64748b', 
                      borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '16px' 
                    }}
                  >
                    Reset
                  </button>
                </div>
              )}
              {/* Режим ввода названия */}
              {saveStatus === 'input' && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '850px', margin:'0 auto' }}>
                  <input 
                    placeholder="Enter subject name..." 
                    value={newSubjectName} 
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    style={{ 
                      flex: 1, padding: '14px', borderRadius: '16px', 
                      border: '1px solid #e2e8f0', fontSize: '16px', outline: 'none' 
                    }}
                  />
                  <button 
                    onClick={handleCheckExistence}
                    style={{ 
                      padding: '14px 24px', background: '#10b981', color: 'white', 
                      borderRadius: '16px', border: 'none', cursor: 'pointer', fontWeight: '600' 
                    }}
                  >
                    Check
                  </button>
                </div>
              )}
              {saveStatus === 'confirming' && (
                <div style={{ 
                  textAlign: 'center', 
                  marginBottom: '24px', 
                  padding: '16px', 
                  background: '#f8fafc', 
                  borderRadius: '16px' 
                }}>
                  <p style={{ 
                    color: '#666', 
                    fontSize: '15px', 
                    fontWeight: '600', 
                    marginBottom: '16px' 
                  }}>
                    Subject with this name already exists!
                  </p>
                  
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button 
                      onClick={handleUpdate} 
                      style={{ 
                        padding: '10px 20px', 
                        background: '#ef4444', 
                        color: 'white', 
                        borderRadius: '12px', // чуть скругленнее для современного вида
                        border: 'none', 
                        cursor: 'pointer', 
                        fontWeight: '600',
                        
                      }}
                    >
                      Update
                    </button>
                    <button 
                      onClick={() => insertNewRecord(pendingName)} 
                      style={{ 
                        padding: '13px 23px', 
                        background: '#10b981', 
                        color: 'white', 
                        borderRadius: '12px', 
                        border: 'none', 
                        cursor: 'pointer', 
                        fontWeight: '600',
             
                      }}
                    >
                      Save as New
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Статус успеха (когда всё сохранилось) */}
              {saveStatus === 'success' && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '16px', 
                  background: '#dcfce7', // светло-зеленый фон
                  color: '#166534',      // темно-зеленый текст
                  borderRadius: '16px', 
                  fontWeight: '600',     // выделяем жирным
                  fontSize: '15px',
                  marginBottom: '20px',
                  border: '1px solid #bbf7d0',
                  width: '100%', maxWidth: '850px', margin:'0 auto' // добавляем легкую обводку
                }}>
                  ✅ Success! The result has been saved.
                </div>
              )}
              
      </main>

      {/* Вынос истории за пределы MainLayout (если нужно) или управление через контекст */}
      <div 
          className={`history-sidebar ${isHistoryOpen ? 'open' : ''}`} 
          style={{ 
            position: 'fixed', 
            right: isHistoryOpen ? '0' : '-400px', 
            top: 0, 
            width: '400px', 
            height: '100vh', 
            background: 'var(--bg-secondary)', 
            borderLeft: '1px solid var(--border-primary)', 
            padding: '24px', 
            transition: '0.3s ease-in-out', 
            zIndex: 1001 // Сделаем еще выше, чем у хедера (хедер был 1000)
          }}
        >
          
          <h3 style={{fontSize: '17px' }}>Calculation History</h3>
           <div 
            className={`history-sidebar ${isHistoryOpen ? 'open' : ''}`} 
            style={{ 
              position: 'fixed', right: isHistoryOpen ? '0' : '-400px', top: 0, width: '400px', 
              height: '100vh', background: '#ffffff', borderLeft: '1px solid #e2e8f0', 
              padding: '24px', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 1001,
              boxShadow: '-4px 0 15px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Calculation History</h3>
              <button onClick={() => setIsHistoryOpen(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <div style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Сортируем: сначала закрепленные, потом остальные */}
              {[...history]
                .sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
                .map((item) => {
                  // Безопасное форматирование даты
                  const formattedDate = item.created_at 
                    ? new Date(item.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
                    : "Дата неизвестна";

                  return (
                    <div 
                      key={item.id} 
                      style={{ 
                        background: item.is_pinned ? '#fefce8' : '#f8fafc',
                        border: item.is_pinned ? '1px solid #fde047' : '1px solid #e2e8f0',
                        borderRadius: '16px', 
                        padding: '16px 20px',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* Название и дата */}
                      <div 
                        onClick={() => handleRename(item.id)} 
                        style={{ cursor: 'text', display: 'flex', flexDirection: 'column', gap: '2px' }}
                      >
                        <span style={{ fontWeight: '600', fontSize: '16px', color: '#1e293b' }}>
                          {item.title || "Без названия"}
                        </span>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {formattedDate}
                        </span>
                      </div>

                      {/* Правая панель: Закрепление, Процент, Удаление */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        

                        <span onClick={() => loadIntoCalculator(item)} 
                        style={{ 
                          cursor: 'pointer',
                          background: item.is_pinned ? '#fcf8cd' : '#eff6ff',
                          color: item.is_pinned ? '#eab308' : '#3b82f6',
                          padding: '6px 12px', 
                          borderRadius: '8px', 
                          fontWeight: '700' 
                        }}>
                          {item.total_percent}%
                        </span>

                        <button 
                          onClick={() => togglePin(item.id)}
                          style={{ 
                            border: 'none', 
                            background: 'none', 
                            cursor: 'pointer', 
                            fontSize: '15px',
                            color: item.is_pinned ? '#eab308' : '#cbd5e1',
                            padding: '0px'
                          }}
                        >
                          📌
                        </button>

                        

                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteHistoryItem(item.id); }} 
                          style={{ 
                            border: 'none', 
                            background: 'none', 
                            color: '#ef4444', 
                            cursor: 'pointer', 
                            fontSize: '20px',
                            padding: '4px'
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>
              </div>
                </div>
  );
};
<style>{`
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
import { useContext, useEffect, useState, useRef } from 'react';
import { useOutletContext, useBlocker } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { getGradeInfo } from '../../utils/gradeConverter';
import { Pencil, Trash2, ArrowLeft, Plus, X, Download } from 'lucide-react';
import { SubjectContext } from '../../utils/SubjectContext';
import { NoteBlock } from './NoteBlock';
import { ImportModal } from './ImportModal';
import { ExportModal } from './ExportModal';

export const CalculatorWidget = () => {
  const { isHistoryOpen, setIsHistoryOpen } = useOutletContext<any>();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const { activeSubject, setActiveSubject, updateSubjectInContext } = useContext(SubjectContext);
  const [name, setName] = useState(''); 
  const [rk1, setRk1] = useState('');
  const [rk2, setRk2] = useState('');
  const [exam, setExam] = useState('');

  const [rk1Note, setRk1Note] = useState('');
  const [rk2Note, setRk2Note] = useState('');
  const [faNote, setFaNote] = useState('');
  const [quarterNote, setQuarterNote] = useState('');

  const [history, setHistory] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [faGrades, setFaGrades] = useState<{ id: number; value: string }[]>([]);
  const [currentFa, setCurrentFa] = useState('');

const [grades, setGrades] = useState<any[]>([]);
const { userSettings, setUserSettings, userId } = useOutletContext<{ 
    userSettings: { course: number, semester: number }, 
    setUserSettings: React.Dispatch<React.SetStateAction<{ course: number, semester: number }>>,
    userId: string | null 
  }>();

  const [targetId, setTargetId] = useState<string | null>(null); 
  const targetIdRef = useRef<string | null>(null); 
  const [saveStatus, setSaveStatus] = useState<'idle' | 'input' | 'confirming' | 'success'>('idle');
  const [newSubjectName, setNewSubjectName] = useState(''); 
  const [pendingName, setPendingName] = useState(''); 

  const [selectedFaIds, setSelectedFaIds] = useState<number[]>([]); 
  const [isSelectionMode, setIsSelectionMode] = useState(false); 
  const [editingId, setEditingId] = useState<number | null>(null);

  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const total = ((Number(rk1) + Number(rk2)) / 2) * 0.6 + Number(exam) * 0.4;
  const faAvg = faGrades.length > 0 
    ? faGrades.reduce((acc, curr) => acc + Number(curr.value), 0) / faGrades.length 
    : 0;
  const gradeInfo = getGradeInfo(total);

  const formatScore = (val: any) => {
    if (val === "" || val === undefined || val === null || val === "NaN") {
      return null;
    }
    const num = Number(val);
    return isNaN(num) ? null : num;
  };
const [isDirty, setIsDirty] = useState(false);

const getBackgroundColor = (letter: string) => {
  if (letter === 'A' || letter === 'A-') return '#38a169'; // Зеленый (5)
  if (letter.startsWith('B')) return '#dd6b20';            // Оранжевый (4)
  if (letter.startsWith('C')) return '#e53e3e';            // Красный (3)
  return '#c05621';                                        // Темно-оранжевый (2)
};
const handleInputChange = (setter: Function, value: string, originalValue: string | undefined) => {
  setter(value);
  setIsDirty(value !== (originalValue?.toString() || ""));
};
let blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  const fetchProfileSettings = async () => {
  if (!userId) return;

  const { data, error } = await supabase
    .from('profiles')
    .select('current_course, current_semester')
    .eq('id', userId)
    .single(); // Теперь, когда мы знаем, что запись точно есть, можно использовать .single()

  if (error) {
    console.error("Ошибка загрузки настроек профиля:", error);
  } else if (data) {

    setUserSettings({ 
      course: data.current_course, 
      semester: data.current_semester 
    });
  }
};
useEffect(() => {
  if (userId) {
    fetchProfileSettings(); // Загружаем настройки из БД
  }
}, [userId]); // Сработает один раз при авторизации

// CalculatorWidget.tsx

useEffect(() => {
  if (userId && userSettings.course && userSettings.semester) {
    // Эта функция сработает сама при любом изменении userSettings!
    fetchGrades(userSettings.course, userSettings.semester);
    
    // Если история в этом же файле:
    fetchHistory(0, 8, userSettings.course, userSettings.semester);
    
    console.log("Данные обновлены для:", userSettings.course, userSettings.semester);
  }
}, [userSettings.course, userSettings.semester, userId]);

const refreshData = () => {
  fetchGrades(userSettings.course, userSettings.semester);
  fetchHistory(0, 8, userSettings.course, userSettings.semester);
};// <-- Эти переменные в массиве - ключ к успеху!

useEffect(() => {

  if (activeSubject && activeSubject.id) {
    const id = String(activeSubject.id); 
    
    setTargetId(id);
    targetIdRef.current = id;

  
    setName(activeSubject.title || '');
    setRk1(activeSubject.rk1 !== null && activeSubject.rk1 !== undefined ? activeSubject.rk1.toString() : '');
    setRk2(activeSubject.rk2 !== null && activeSubject.rk2 !== undefined ? activeSubject.rk2.toString() : '');
    setExam(activeSubject.exam !== null && activeSubject.exam !== undefined ? activeSubject.exam.toString() : '');
    
    if (activeSubject.fa_grades) {
      setFaGrades(activeSubject.fa_grades);
    }
  }
}, [activeSubject]);


useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [isDirty]);

const backgroundColor = getBackgroundColor(gradeInfo.letter);

const togglePin = async (id: string) => {
  const item = history.find(i => i.id === id);
  if (!item) return;

  const newPinnedStatus = !item.is_pinned;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase
    .from('grades')
    .update({ is_pinned: newPinnedStatus })
    .eq('id', id)
    .eq('user_id', user.id); 

  if (error) {
    console.error("Error whule updating:", error);
    return;
  }
  setHistory(prevHistory => 
    prevHistory.map(i => 
      i.id === id ? { ...i, is_pinned: newPinnedStatus } : i
    )
  );
};

const getScoreColor = (score: any) => {
  const num = Number(score);
  if (!score || num < 50) return '#e53e3e'; 
  if (num >= 50 && num <= 69) return '#e53e3e'; 
  if (num >= 70 && num <= 89) return '#d69e2e'; 
  return '#38a169'; 
};

const deleteHistoryItem = async (id: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    alert("ERROR: You are not registered!");
    return;
  }

  const { error } = await supabase
    .from('grades')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id); 

  if (error) {
    console.error("Deleting error:", error.message);
    alert("Couldn't deleted subject. Try again");
    return;
  }

  setHistory(prevHistory => prevHistory.filter(item => item.id !== id));
};

const fetchHistory = async (page = 0, pageSize = 8, course: number, semester: number) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('grades')
    .select(`
      id, title, rk1, rk2, exam, fa_grades, total_percent, 
      is_pinned, rk1_note, rk2_note, fa_note, quarter_note, created_at,
      course, semester
    `)
    .eq('user_id', user.id)
    .eq('course', course)       // Фильтр по курсу
    .eq('semester', semester)   // Фильтр по семестру
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching history:", error);
    return;
  }

  if (data) {
    setHistory(prev => page === 0 ? data : [...prev, ...data]);
    setHasMore(data.length === pageSize);
  }
};

const fetchGrades = async (course: number, semester: number) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('grades')
    .select('*')
    .eq('user_id', user.id)
    .eq('course', userSettings.course)
    .eq('semester', userSettings.semester);

  if (error) {
    console.error("Error fetching grades:", error);
  } else {
    // Обновляем состояние твоих оценок в виджете
    setGrades(data || []); 
  }
};

useEffect(() => {
  if (userSettings) {
    // Загружаем оценки для текущего семестра
    fetchGrades(userSettings.course, userSettings.semester);
    // Загружаем историю для текущего семестра
    fetchHistory(0, 8, userSettings.course, userSettings.semester);
  }
}, [userSettings]); // Сработает при изменении курса/семестра
const handleRename = async (id: string) => {
  const newName = prompt("Enter new name of subject:");
  if (!newName) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert("You are not registered!");
    return;
  }

  const { data, error } = await supabase
    .from('grades')
    .update({ title: newName })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error("Updating Error:", error.message);
    alert(`Error: ${error.message}`);
  } else {
    setHistory(prev => prev.map(item => item.id === id ? { ...item, title: newName } : item));
  }
};
const handleDeleteSelected = () => {
  setFaGrades(faGrades.filter(g => !selectedFaIds.includes(g.id)));
  setSelectedFaIds([]);
  setIsSelectionMode(false);
};

const handleEditSelected = () => {
  const item = faGrades.find(g => g.id === selectedFaIds[0]);
  if (item) {
    setCurrentFa(item.value); 
    setEditingId(item.id);    
    setSelectedFaIds([]);     
    setIsSelectionMode(false);
  }
};

const handlePressStart = (id: number) => {
  const timeout = setTimeout(() => {
    toggleSelection(id); 
  }, 300);
  setTimer(timeout);
};

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
  setRk1Note(''); 
  setRk2Note('');
  setFaNote('');
  setQuarterNote('');
  setNewSubjectName('');
  setSaveStatus('idle');
};

const finishSave = () => {
  setSaveStatus('success');
  
  fetchHistory(0, 8, userSettings.course, userSettings.semester);
  
  setTimeout(() => {
    setSaveStatus('idle');
    setNewSubjectName('');
  }, 2000); 
};


const handleCheckExistence = async () => {

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;


  const { data } = await supabase
    .from('grades')
    .select('id')
    .eq('title', newSubjectName)
    .eq('user_id', user.id); 

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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert("Ошибка: пользователь не авторизован");
    return;
  }

  let finalName = baseName;
  let counter = 2;

  while (true) {
    const { data } = await supabase
      .from('grades')
      .select('id')
      .eq('title', finalName)
      .eq('user_id', user.id); 

    if (data && data.length > 0) {
      finalName = `${baseName} ${counter}`;
      counter++;
    } else {
      break;
    }
  }

  const newRecord = {
    title: finalName,
    rk1: formatScore(rk1),
    rk2: formatScore(rk2),
    exam: formatScore(exam),
    fa_grades: faGrades || [],
    rk1_note: rk1Note,
    rk2_note: rk2Note,
    fa_note: faNote,
    quarter_note: quarterNote,
    total_percent: parseFloat(total.toFixed(1)),
    is_pinned: false,
    user_id: user.id,
    course: userSettings.course, 
    semester: userSettings.semester
  };

console.log("DEBUG: Отправляем объект в БД:", newRecord);
const { error } = await supabase.from('grades').insert([newRecord]);
  
  if (error) {
    console.error("Ошибка Supabase:", error);
  } else {
    finishSave();
  }
};
const handleRk1Change = (val: string) => {
  const num = Number(val);
  const validatedVal = val === "" ? "" : Math.max(0, Math.min(100, num)).toString();
  setRk1(validatedVal);
  handleInputChange(setRk1, validatedVal, activeSubject?.rk1?.toString());
  if (validatedVal === "") {
    setRk2(""); 
    setExam(""); 
  }
};

const handleRk2Change = (val: string) => {

  const num = Number(val);
  const validatedVal = val === "" ? "" : Math.max(0, Math.min(100, num)).toString();
  
  setRk2(validatedVal);

  handleInputChange(setRk2, validatedVal, activeSubject?.rk2?.toString());
  
  if (validatedVal === "") {
    setExam("");
  }
};

  const handleUpdate = async (idFromModal?: string) => {
  const currentId = targetIdRef.current;
  const { data: { user } } = await supabase.auth.getUser();

  console.log("--- DEBUG START ---");
  console.log("ID из аргумента (modal):", idFromModal);
  console.log("ID из Ref:", targetIdRef.current);
  console.log("Юзер:", user);
  console.log("--- DEBUG END ---");

  if (!currentId || !user) {
    alert(`Ошибка: Не выбран предмет. ID из Ref: ${targetIdRef.current}, ID из Modal: ${idFromModal}`);
    return;
  }

  if (!currentId) {
    console.error("КРИТИЧЕСКАЯ ОШИБКА: ID пропал!");
    return;
  }

  if (rk2 && !rk1) {
    alert("Ошибка: Нельзя поставить РК2 без РК1!");
    return;
  }
  if (exam && (!rk1 || !rk2)) {
    alert("Ошибка: Нельзя поставить экзамен без РК1 и РК2!");
    return;
  }

  const formatValue = (val: any) => {
    const num = Number(val);
    return (val === "" || val === undefined || val === null || isNaN(num)) ? null : num;
  };

  const updateData = {
    rk1: formatValue(rk1),
    rk2: formatValue(rk2),
    exam: formatValue(exam),
    rk1_note: rk1Note,
    rk2_note: rk2Note,
    fa_note: faNote,
    quarter_note: quarterNote,
    fa_grades: Array.isArray(faGrades) ? faGrades : [],
    total_percent: Number(total.toFixed(1))
  };

  try {
    const { error } = await supabase
      .from('grades')
      .update(updateData)
      .eq('id', currentId)
      .eq('user_id', user.id); 

    if (error) throw error;
    
    updateSubjectInContext({ ...updateData, id: currentId });
    finishSave();
    setIsDirty(false);
  } catch (err) {
    console.error("Ошибка при обновлении:", err);
  }
};

const handleScoreChange = (value: string, setter: React.Dispatch<React.SetStateAction<any>>, originalValue?: string) => {
  if (value === "") {
    setter(""); 
    handleInputChange(setter, "", originalValue); 
  } else {
    const num = Math.max(0, Math.min(100, Number(value)));
    const strNum = num.toString();
    setter(strNum);
    handleInputChange(setter, strNum, originalValue);
  }
};
  const loadIntoCalculator = (item: any) => {
    const normalizedItem = {
    ...item,
    id: String(item.id) 
  };
  console.log("DEBUG: ID предмета успешно записан в targetIdRef:", item.id);
  targetIdRef.current = normalizedItem.id;
  
    setRk1(item.rk1?.toString() || '');
    setRk2(item.rk2?.toString() || '');
    setExam(item.exam?.toString() || '');
    setFaGrades(item.fa_grades || []);
    setRk1Note(item.rk1_note || "");
    setRk2Note(item.rk2_note || "");
    setFaNote(item.fa_note || "");
    setQuarterNote(item.quarter_note || "");
    setNewSubjectName(item.title);
    setSaveStatus('idle'); 
    setActiveSubject(normalizedItem);
    
    if (setIsHistoryOpen) setIsHistoryOpen(false);
  };
const isRk2Disabled = !rk1 || rk1 === ""; 
const isExamDisabled = !rk1 || !rk2 || rk1 === "" || rk2 === ""; 

  return (
    <div id="wrapper">
      {blocker.state === "blocked" && (
        <div className="modal">
          <div className="modal-content">
            <h3>Unsaved Changes</h3>
            <p>You have made some changes. Do you want to save them before leaving?</p>
            
            <div className="modal-buttons">
              <button onClick={async () => { await handleUpdate(targetIdRef.current ?? undefined); setIsDirty(false); blocker.proceed(); }}>Save</button>
              <button onClick={() => blocker.proceed()}>Discard</button>
              <button onClick={() => blocker.reset()}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <main className="layout" >
        <section style={{ 
          background: 'var(--bg-secondary)', 
          padding: '30px', 
          margin: '0 auto',
          borderRadius: '20px', 
          width:'100%',
          maxWidth: '850px',
          boxShadow: 'var(--card-shadow)', 
          border: '1px solid #e2e8f0',
          marginBottom: '24px' 
        }}>
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
              
  
              <div style={{ 
                background: backgroundColor,
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* РК-1 */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#475569' }}>RK-1</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <input 
                    type="number" 
                    className="score-input" 
                    min="0" 
                    max="100"
                    value={rk1} 
                    onChange={(e) => {handleScoreChange(e.target.value, setRk1);handleRk1Change(e.target.value)}}
                    placeholder="Score"
                    style={{ 
                      borderColor: getScoreColor(rk1)
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
                <NoteBlock 
                  label="RK-1 Note"
                  note={rk1Note}
                  onSave={(val: string) => setRk1Note(val)} // Просто обновляем стейт
                  onDelete={() => setRk1Note('')}          // Просто очищаем стейт
                />
              </div>

              {/* РК-2 (по аналогии) */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#475569' }}>RK-2</h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <input 
                    type="number" 
                    className="score-input" 
                    min="0" 
                    max="100"
                    value={rk2}
                    onChange={(e) => {handleScoreChange(e.target.value, setRk2);handleRk2Change(e.target.value)}}
                    disabled={isRk2Disabled}
                    placeholder="Score"
                    style={{ 
                      borderColor: getScoreColor(rk2),
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
                <NoteBlock 
                  label="RK-2 Note"
                  note={rk2Note}
                  onSave={(val: string) => setRk2Note(val)} // Просто обновляем стейт
                  onDelete={() => setRk2Note('')}          // Просто очищаем стейт
                />
              </div>
            </div>

            </section>
               <div style={{ 
                  display: 'flex',           
                  justifyContent: 'center', 
                  alignItems: 'flex-start',  
                  gap: '20px',            
                  width: '100%',
                  maxWidth: '1200px',    
                  margin: '0 auto',
                  marginBottom: '24px'        
                }}>
                  <div style={{ flex: '1', maxWidth: '600px' }}>
                  <section style={{ height: '277.5px' ,background: 'var(--bg-secondary)',boxShadow: 'var(--card-shadow)',  padding: '30px', borderRadius: '20px', border: '1px solid var(--border-primary)', width:'100%', maxWidth: '585px' }}>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
                      <h3 style={{ flex: '1', margin: '8px' ,fontSize: '17px', fontWeight: '700', color: '#666' }}>Formative Assessment (FA)</h3>
                       <div style={{ display: 'flex', gap: '10px',marginLeft: '15px'}}>
                          <input 
                            className="score-input" 
                            placeholder='Score'
                            min="0" 
                            max="100"
                            value={currentFa}
                            onChange={(e) => {
                              const val = e.target.value;
                              
                 
                              const originalFa = editingId 
                                ? faGrades.find((g: any) => g.id === editingId)?.value?.toString() || "" 
                                : "";

                              if (val === "") {
                                setCurrentFa(""); 
                                handleInputChange(setCurrentFa, "", originalFa); 
                              } else {
                                const num = Math.max(0, Math.min(100, Number(val)));
                                setCurrentFa(num.toString());
                                handleInputChange(setCurrentFa, num.toString(), originalFa);
                              }
                            }}
                            style={{ flex: 1, marginBottom: 0, maxWidth: '70px' }}
                          />
                          <div style={{display: 'flex'}}>
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
                          
                        </div>
                        
                      </div>
                      
                      {selectedFaIds.length > 0 && (
                        <div   
                          key="action-panel" 
                          className="animate-appear" style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          margin: '0',
                          padding: '0px 0px 0px 10px',
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
                      
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px', marginBottom: '0px'}}>
                      {faGrades.map((grade) => (
                        <div 
                          key={grade.id}
                          // Старт таймера при нажатии (и мыши, и таче)
                          onMouseDown={() => handlePressStart(grade.id)}
                          onMouseUp={handlePressEnd}
                          onMouseLeave={handlePressEnd} 
                          
                          // Для мобильных устройств:
                          onTouchStart={() => handlePressStart(grade.id)}
                          onTouchEnd={handlePressEnd}
                          
                          style={{
                            padding: '8px 16px',
                            border: selectedFaIds.includes(grade.id) ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                            backgroundColor: selectedFaIds.includes(grade.id) ?  '#3b82f6' : 'white',
                            boxShadow: selectedFaIds.includes(grade.id) ?  '-2px 0 10px #94bdff' : '1px 0 0 white',
                            borderRadius: '12px',      
                            display: 'flex',
                            alignItems: 'center',
                            maxWidth: '60px',
                            maxHeight: '36px',
                
                          }}
                        >
                          <span style={{ fontWeight: '600', fontSize: '15px', color: selectedFaIds.includes(grade.id) ?  'white' : 'black'}}>{grade.value}</span>
                        </div>
                      ))}
                    </div>
                    {editingId && (
                      <div style={{ color: '#3075e6', marginBottom: '10px', fontSize: '14px', margin: '15px 0 0 0',
                          padding: '10px 5px 0px 5px', }}>
                        Editing...
                        <span onClick={() => { setEditingId(null); setCurrentFa(''); }} style={{  padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer' , textDecoration: 'none', marginLeft: '15px' }}>
                          Cancel
                        </span>
                      </div>
                    )}
                    
                    {faGrades.length > 0 && (
                      <div style={{ 
                        marginTop: '15px', 
                        padding: '16px', 
                        background: '#eff6ff', 
                        border: '1px solid #dbeafe', 
                        borderRadius: '12px' 
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#1e40af', fontWeight: '600',fontSize: '16px', marginRight: '5px' }}>Current (FA) Avg:</span>
                          <span style={{  background: '#3b82f6' ,borderRadius: '10px', padding:'10px', fontSize: '1.0rem', fontWeight: '600', color: '#ffffff' }}>
                            {faAvg.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
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
                height: '277.5px',
                boxShadow: 'var(--card-shadow)', 
              }}>
                <h3 style={{ marginBottom: '10px', fontSize: '16px', fontWeight: '700', color: '#666' }}>Summative Assessment for Quarter</h3>
                <div style={{ display: 'flex', padding: '10px',alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <input 
                    type="number" 
                    className='score-input'
                    value={exam}
                    onChange={(e) => {
                      handleInputChange(setExam, e.target.value, activeSubject?.exam?.toString());
                    }}
                    disabled={isExamDisabled}
                    placeholder="Score"
                    style={{ 
                      borderColor: getScoreColor(rk1),
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
                <NoteBlock 
                  label="Exam Note"
                  note={quarterNote}
                  onSave={(val: string) => setQuarterNote(val)} // Просто обновляем стейт
                  onDelete={() => setQuarterNote('')}          // Просто очищаем стейт
                />
                
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
                    onChange={(e) => 
                      setNewSubjectName(e.target.value)}
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
                      onClick={() => handleUpdate(targetIdRef.current ?? undefined)}
                      
                      style={{ 
                        padding: '10px 20px', 
                        background: '#ef4444', 
                        color: 'white', 
                        borderRadius: '12px', 
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
                  background: '#dcfce7', 
                  color: '#166534',      
                  borderRadius: '16px', 
                  fontWeight: '600',   
                  fontSize: '15px',
                  marginBottom: '20px',
                  border: '1px solid #bbf7d0',
                  width: '100%', maxWidth: '850px', margin:'0 auto'
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
            zIndex: 1001 
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
              <div style={{display: 'flex', marginTop: '6px'}}>
              <button style={{ background: 'none', border: 'none', fontSize: '35px', cursor: 'pointer', color: '#707f94' }} onClick={() => setIsImportOpen(true)}><Plus size={29} strokeWidth={1.5} /></button>
              {isImportOpen && (
              <ImportModal 
                userId={userId} 
                course={userSettings.course} 
                semester={userSettings.semester} 
                onClose={() => setIsImportOpen(false)}
                onImportSuccess={() => {
                    // Тут вызываем обновление данных, как мы делали раньше
                    refreshData(); 
                }}
              />
            )}
              <button onClick={() => setIsExportOpen(true)}><Download size={29} strokeWidth={1.5}/></button> 
              {isExportOpen && (
                <ExportModal 
                  data={grades} // Передаем список предметов, которые сейчас отображаются
                  onClose={() => setIsExportOpen(false)} 
                />
              )}

              <button onClick={() => setIsHistoryOpen(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#64748b' }}><X size={29} strokeWidth={1.5} /></button>
            </div>
            </div>

            <div style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[...history]
                .sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
                .map((item) => {
                  const formattedDate = item.created_at 
                    ? new Date(item.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
                    : "Дата неизвестна";

                  return (
                    <div 
                      key={item.id} 
                      style={{ 
                        background: item.is_pinned ? '#fefce8' : '#f8fafc',
                        border: item.is_pinned ? '1px solid #fbf2c2' : '1px solid #e2e8f0',
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
              {hasMore && (
                <button
                  onClick={() => {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchHistory(nextPage, 8, userSettings.course, userSettings.semester);
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    cursor: 'pointer',
                    marginTop: '8px',
                    fontWeight: '600'
                  }}
                >
                  Load More
                </button>
              )}
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
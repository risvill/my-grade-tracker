import { useContext, useEffect, useState, useRef } from 'react';
import { useOutletContext, useBlocker } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { getGradeInfo } from '../../utils/gradeConverter';
import { SubjectContext } from '../../utils/SubjectContext';

import { ACHIEVEMENTS, unlockAchievement, type Achievement } from '../../utils/achievments';
import { 
  calculateTotal, 
  calculateFaAvg, 
  formatScore, 
  getBackgroundColor, 
  getScoreColor 
} from '../calculator/CalculatorLogic';
import { clampScore, handleScoreChange } from './scoreValidation';
import { deleteSelected, getFirstSelected, toggleSelection } from './faSelectionUtils';
import CalculatorView from './CalculatorView';

export const CalculatorWidget = () => {
  const { isHistoryOpen, setIsHistoryOpen } = useOutletContext<any>();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const { activeSubject, setActiveSubject, updateSubjectInContext } = useContext(SubjectContext);
  const [name, setName] = useState(''); 
  const [rk1, setRk1] = useState('');
  const [rk2, setRk2] = useState('');
  const [exam, setExam] = useState('');

  const [unlocked, setUnlocked] = useState<string[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem('unlocked_achievements');
    if (saved) {
      setUnlocked(JSON.parse(saved));
    }
  }, []);

const [congratsModal, setCongratsModal] = useState<Achievement | null>(null);

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
  const total = calculateTotal(rk1, rk2, exam);
  const faAvg = calculateFaAvg(faGrades);
  const gradeInfo = getGradeInfo(total);
  const scoreColor = getScoreColor(total);
  const bgColor = getBackgroundColor(gradeInfo.letter);

const [isDirty, setIsDirty] = useState(false);

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
    .single(); 

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
    fetchProfileSettings();
  }
}, [userId]); 


useEffect(() => {
  if (userId && userSettings.course && userSettings.semester) {
    fetchGrades(userSettings.course, userSettings.semester);
    
    fetchHistory(0, 8, userSettings.course, userSettings.semester);
    
    console.log("Данные обновлены для:", userSettings.course, userSettings.semester);
  }
}, [userSettings.course, userSettings.semester, userId]);

const refreshData = () => {
  fetchGrades(userSettings.course, userSettings.semester);
  fetchHistory(0, 8, userSettings.course, userSettings.semester);
};

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
const triggerAchievement = (id: string) => {
    unlockAchievement(id, (unlockedId) => {
      const ach = ACHIEVEMENTS.find(a => a.id === unlockedId);
      setCongratsModal(ach || null);
      setUnlocked(prev => [...prev, unlockedId]);
    });
  };

const checkAllAchievements = (currentData: any[]) => {
  const unlocked = JSON.parse(localStorage.getItem('unlocked_achievements') || '[]');

  ACHIEVEMENTS.forEach((ach) => {
    if (ach.condition(currentData) && !unlocked.includes(ach.id)) {
      triggerAchievement(ach.id);
    }
  });
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

    fetchGrades(userSettings.course, userSettings.semester);
  
    fetchHistory(0, 8, userSettings.course, userSettings.semester);
  }
}, [userSettings]); 
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
  setFaGrades(deleteSelected(faGrades, selectedFaIds));
  setSelectedFaIds([]);
  setIsSelectionMode(false);
};

const handleEditSelected = () => {
  const item = getFirstSelected(faGrades, selectedFaIds);
  if (item) {
    setCurrentFa(item.value);
    setEditingId(item.id);
    setSelectedFaIds([]);
    setIsSelectionMode(false);
  }
};

const handlePressStart = (id: number) => {
  const timeout = setTimeout(() => {
    setSelectedFaIds(prev => {
      const newSelection = toggleSelection(prev, id);
      setIsSelectionMode(newSelection.length > 0);
      return newSelection;
    });
  }, 300);
  
  setTimer(timeout);
};

const handlePressEnd = () => {
  if (timer) {
    clearTimeout(timer);
    setTimer(null);
  }
};

const handleToggle = (id: number) => {
  const newSelection = toggleSelection(selectedFaIds, id);
  setSelectedFaIds(newSelection);
  setIsSelectionMode(newSelection.length > 0);
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
    
    const updatedData = [...grades, newRecord]; 
    

    checkAllAchievements(updatedData);
  }

  triggerAchievement('first_grade');
};
const handleRk1Change = (val: string) => {
  handleScoreChange(val, setRk1, activeSubject?.rk1?.toString(), handleInputChange);
  

  if (val === "") {
    setRk2(""); 
    setExam(""); 
  }
};

const handleRk2Change = (val: string) => {
  handleScoreChange(val, setRk2, activeSubject?.rk2?.toString(), handleInputChange);
  
  if (val === "") {
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
  <CalculatorView
    rk1={rk1}
    rk2={rk2}
    exam={exam}
    handleUpdate={handleUpdate}
    handleRename={handleRename}
    blocker={blocker}
    targetIdRef={targetIdRef}
    setIsDirty={setIsDirty}
    unlocked={unlocked}
    total={total}
    gradeInfo={gradeInfo}
    backgroundColor={backgroundColor}
    handleScoreChange={handleScoreChange}
    setRk1={setRk1}
    handleRk1Change={handleRk1Change}
    rk1Note={rk1Note}
    setRk1Note={setRk1Note}
    setRk2={setRk2}
    rk2Note={rk2Note}
    setRk2Note={setRk2Note}
    handleRk2Change={handleRk2Change}
    isRk2Disabled={isRk2Disabled}
    currentFa={currentFa}
    editingId={editingId}
    selectedFaIds={selectedFaIds}
    faGrades={faGrades}
    userSettings={userSettings}
    fetchHistory={fetchHistory}
    setPage={setPage}
    page={page}
    hasMore={hasMore}
    setHasMore={setHasMore}
    history={history}
    setHistory={setHistory}
    userId={userId}
    isImportOpen={isImportOpen}
    setIsImportOpen={setIsImportOpen}
    isExportOpen={isExportOpen}
    setIsExportOpen={setIsExportOpen}
    refreshData={refreshData}
    grades={grades}
    loadIntoCalculator={loadIntoCalculator}
    togglePin={togglePin}
    deleteHistoryItem={deleteHistoryItem}
    handlePressStart={handlePressStart}
    handlePressEnd={handlePressEnd}
    pendingName={pendingName}
    saveStatus={saveStatus}
    congratsModal={congratsModal}
    setCongratsModal={setCongratsModal}
    insertNewRecord={insertNewRecord}
    isHistoryOpen={isHistoryOpen}     
    setIsHistoryOpen={setIsHistoryOpen}
    handleReset={handleReset}
    newSubjectName={newSubjectName}
    setNewSubjectName={setNewSubjectName}
    handleCheckExistence={handleCheckExistence}
    setExam={setExam}
    activeSubject={activeSubject}
    isExamDisabled={isExamDisabled}
    quarterNote={quarterNote}
    setQuarterNote={setQuarterNote}
    handleInputChange={handleInputChange}
    setSaveStatus={setSaveStatus}
    faAvg={faAvg}
    setCurrentFa={setCurrentFa}
    setEditingId={setEditingId}
    setFaGrades={setFaGrades}
    setSelectedFaIds={setSelectedFaIds}
    setIsSelectionMode={setIsSelectionMode}
    handleDeleteSelected={handleDeleteSelected}
    handleEditSelected={handleEditSelected}
  />
);
};
<style>{`
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
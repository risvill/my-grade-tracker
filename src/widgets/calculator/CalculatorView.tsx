import React from "react";
import { BadgeBar } from './BadgeBar';
import { NoteBlock } from './NoteBlock';
import { ImportModal } from './ImportModal';
import { ExportModal } from './ExportModal';
import { Pencil, Trash2, ArrowLeft, Plus, X, Download } from 'lucide-react';
import { getScoreColor } from "../calculator/CalculatorLogic";
import type { Achievement } from "../../utils/achievments";
type CalculatorViewProps = {
  rk1: string; rk2: string; exam: string;
  handleUpdate: (idFromModal?: string) => Promise<void>; handleRename: (id: string) => Promise<void>;
  blocker: any; targetIdRef: any; unlocked: string[]; total: number;
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
  gradeInfo: any; backgroundColor: string;
  handleScoreChange: ( value: string, setter: React.Dispatch<React.SetStateAction<any>>, originalValue?: string ) => void;
  setRk1: React.Dispatch<React.SetStateAction<string>>; handleRk1Change: (val: string) => void; rk1Note: string; setRk1Note: React.Dispatch<React.SetStateAction<string>>;
  setRk2: React.Dispatch<React.SetStateAction<string>>; rk2Note: string; setRk2Note: React.Dispatch<React.SetStateAction<string>>; handleRk2Change: (val: string) => void; isRk2Disabled: boolean;
  faGrades: any[]; currentFa: string; editingId: number | null; selectedFaIds: number[]; userSettings: { course: number, semester: number };
  fetchHistory: (page: number, pageSize: number, course: number, semester: number) => Promise<void>; setPage: React.Dispatch<React.SetStateAction<number>>; page: number; hasMore: boolean; setHasMore: React.Dispatch<React.SetStateAction<boolean>>;
  history: any[]; setHistory: React.Dispatch<React.SetStateAction<any[]>>; userId: string | null; isImportOpen: boolean;
  setIsImportOpen: (val: boolean) => void; isExportOpen: boolean; setIsExportOpen: (val: boolean) => void;
  refreshData: () => void;
  grades: any[]; loadIntoCalculator: (item: any) => void; togglePin: (id: string) => Promise<void>;
  deleteHistoryItem: (id: string) => Promise<void>; handlePressStart: (id: number) => void; handlePressEnd: () => void;
  pendingName: string; congratsModal: Achievement | null; setCongratsModal: React.Dispatch<React.SetStateAction<Achievement | null>>;
  insertNewRecord: (baseName: string) => Promise<void>; isHistoryOpen: boolean;  setIsHistoryOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleReset: () => void;
  newSubjectName: string; setNewSubjectName: React.Dispatch<React.SetStateAction<string>>;
  handleCheckExistence: () => Promise<void>;
  setExam: React.Dispatch<React.SetStateAction<string>>;
  activeSubject: any;
  isExamDisabled: boolean;
  quarterNote: string;
  setQuarterNote: React.Dispatch<React.SetStateAction<string>>;
  handleInputChange: (setter: Function, value: string, originalValue: string | undefined) => void;
  saveStatus: 'idle' | 'input' | 'confirming' | 'success';
  setSaveStatus: React.Dispatch<React.SetStateAction<'idle' | 'input' | 'confirming' | 'success'>>;
  faAvg: number | string;
  setCurrentFa: React.Dispatch<React.SetStateAction<string>>;
  setEditingId: React.Dispatch<React.SetStateAction<number | null>>;
  setFaGrades: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedFaIds: React.Dispatch<React.SetStateAction<number[]>>;
  setIsSelectionMode: React.Dispatch<React.SetStateAction<boolean>>;
  handleDeleteSelected: () => void;
  handleEditSelected: (id: number) => void;
};


export default function CalculatorView({
  rk1, rk2, exam, handleUpdate, handleRename, blocker, targetIdRef, setIsDirty, unlocked, total, gradeInfo, handleInputChange, backgroundColor, handleScoreChange, setRk1, handleRk1Change, rk1Note, setRk1Note, setRk2, rk2Note, setRk2Note, handleRk2Change, isRk2Disabled, faGrades, currentFa, editingId, selectedFaIds, userSettings, fetchHistory, setPage, page, hasMore, setHasMore, history, setHistory, userId, isImportOpen, setIsImportOpen, isExportOpen, setIsExportOpen, refreshData, grades, loadIntoCalculator, togglePin, deleteHistoryItem, handlePressStart, handlePressEnd, pendingName, saveStatus, congratsModal, setCongratsModal, insertNewRecord, isHistoryOpen, setIsHistoryOpen, handleReset, newSubjectName, setNewSubjectName, handleCheckExistence, setExam, activeSubject, isExamDisabled, quarterNote, setQuarterNote, setSaveStatus, faAvg, setCurrentFa, setEditingId, setFaGrades, setSelectedFaIds, setIsSelectionMode, handleDeleteSelected, handleEditSelected
}: CalculatorViewProps) {
  return (
    <div className="wrapper">
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
      
      <main>
        <BadgeBar unlocked={unlocked} />
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
                  onSave={(val: string) => setRk2Note(val)} 
                  onDelete={() => setRk2Note('')}       
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
                                onClick={() => handleEditSelected(selectedFaIds[0])} 
                                style={{ padding: '8px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#3b82f6' }}// Оставь свой стиль как есть
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
                         
                          onMouseDown={() => handlePressStart(grade.id)}
                          onMouseUp={handlePressEnd}
                          onMouseLeave={handlePressEnd} 
                          
                
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
                            {Number(faAvg).toFixed(1)}%
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
                  onSave={(val: string) => setQuarterNote(val)} 
                  onDelete={() => setQuarterNote('')}   
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
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '850px', margin:'20px auto' }}>
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
      {congratsModal && (
        <div className="modal">
        <div className="modal-content animate-pop-in">
          <div className="achievement-icon">{congratsModal.icon}</div>
          <h2>Achievement Unlocked!</h2>
          <p className="achievement-title">{congratsModal.title}</p>
          <p className="achievement-desc">{congratsModal.description}</p>
          <button className="primary-btn" onClick={() => setCongratsModal(null)}>
            Awesome!
          </button>
        </div>
        </div>
        )}

        

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
                    refreshData(); 
                }}
              />
            )}
              <button style={{ background: 'none', border: 'none', fontSize: '35px', cursor: 'pointer', color: '#707f94' }} onClick={() => setIsExportOpen(true)}><Download size={27} strokeWidth={1.5}/></button> 
              {isExportOpen && (
                <ExportModal 
                  data={grades} 
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
}
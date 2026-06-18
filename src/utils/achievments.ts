
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (data: any[]) => boolean;
}
export const ACHIEVEMENTS: Achievement[] = [
  // --- Starter Pack ---
  { id: 'first_grade', title: 'First Step', description: 'Added your first grade', icon: '🌱', condition: (data) => data.length >= 1 },
  { id: 'hard_worker', title: 'Hard Worker', description: 'Already 5 subjects in the list', icon: '📚', condition: (data) => data.length >= 5 },
  { id: 'top_student', title: 'Top Student', description: 'Have a subject with 100%', icon: '⭐', condition: (data) => data.some(item => item.total_percent === 100) },
  { id: 'almost_there', title: 'Almost a Pro', description: 'Total percentage over 90%', icon: '🎯', condition: (data) => data.some(item => item.total_percent > 90) },
  
  // --- Progress Pack ---
  { id: 'academic_star', title: 'Academic Star', description: '10 subjects added', icon: '🌟', condition: (data) => data.length >= 10 },
  { id: 'serious_business', title: 'Serious Business', description: '15 subjects added', icon: '💼', condition: (data) => data.length >= 15 },
  { id: 'perfectionist', title: 'Perfectionist', description: 'Three subjects at 100%', icon: '💎', condition: (data) => data.filter(i => i.total_percent === 100).length >= 3 },
  { id: 'high_flyer', title: 'High Flyer', description: 'Three subjects above 90%', icon: '🚀', condition: (data) => data.filter(i => i.total_percent > 90).length >= 3 },
  { id: 'steady_progress', title: 'Steady Progress', description: 'All subjects above 50%', icon: '⚖️', condition: (data) => data.length > 0 && data.every(i => i.total_percent > 50) },
  { id: 'night_owl', title: 'Night Owl', description: 'Added more than 3 subjects', icon: '🌙', condition: (data) => data.length >= 3 },
  
  // --- Pro Pack ---
  { id: 'data_collector', title: 'Data Collector', description: '20 subjects in the database', icon: '🗃️', condition: (data) => data.length >= 20 },
  { id: 'lucky_one', title: 'Lucky One', description: 'Found a subject with exactly 77%', icon: '🍀', condition: (data) => data.some(i => i.total_percent === 77) },
  { id: 'survivor', title: 'Survivor', description: 'Average score above 60% across all', icon: '🛡️', condition: (data) => data.length > 0 && (data.reduce((acc, curr) => acc + curr.total_percent, 0) / data.length) > 60 },
  { id: 'speed_runner', title: 'Speed Runner', description: 'Added 2 subjects in a row', icon: '⚡', condition: (data) => data.length >= 2 },
  { id: 'pro_analyst', title: 'Pro Analyst', description: 'Total score across all > 400', icon: '📊', condition: (data) => data.reduce((acc, curr) => acc + curr.total_percent, 0) > 400 },
  { id: 'master_of_none', title: 'Jack of All Trades', description: '7+ different subjects', icon: '🎨', condition: (data) => data.length >= 7 },
  { id: 'consistent', title: 'Consistent', description: 'Got at least 80% in one subject', icon: '✅', condition: (data) => data.some(i => i.total_percent >= 80) },
  { id: 'underdog', title: 'Underdog', description: 'Over 95% in at least one subject', icon: '🔥', condition: (data) => data.some(i => i.total_percent > 95) },
  { id: 'halfway_there', title: 'Halfway There', description: 'Added 12 subjects', icon: '⏳', condition: (data) => data.length >= 12 },
  { id: 'gold_standard', title: 'Gold Standard', description: 'Average score > 85%', icon: '🏆', condition: (data) => data.length > 0 && (data.reduce((acc, curr) => acc + curr.total_percent, 0) / data.length) > 85 }
];

export const unlockAchievement = (id: string, onShowModal: (id: string) => void) => {
  // Получаем список уже разблокированных
  const saved = localStorage.getItem('unlocked_achievements');
  const unlocked = saved ? JSON.parse(saved) : [];
  
  // Если еще нет в списке — разблокируем
  if (!unlocked.includes(id)) {
    const newUnlocked = [...unlocked, id];
    localStorage.setItem('unlocked_achievements', JSON.stringify(newUnlocked));
    
    // Показываем поздравление только сейчас
    onShowModal(id);
  }
};
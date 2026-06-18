import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from "../utils/supabaseClient";
import { LogOut, Settings } from "lucide-react";
import { SettingsModal } from "../widgets/calculator/SettingModal";

export const MainLayout = () => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [userSettings, setUserSettings] = useState({ course: 1, semester: 1 });
  const refreshData = () => {
  // Вызываем обновление всех виджетов, которые нам нужны
  // Можно использовать EventBus, как мы обсуждали, 
  // или просто передать эту функцию в SettingModal
};

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUserId();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/'); 
  };

  return (
    
    <div id="wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '16px 40px', borderBottom: '1px solid #edf2f7', background: '#fff', position: 'sticky', top: 0, zIndex: 1000 }}>
        <nav style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#4a5568' }}>GradeMaster</div>

          <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            {['calculator', 'predictor', 'analytics'].map((path) => (
              <NavLink key={path} to={`/${path}`} style={({ isActive }) => ({
                  textTransform: 'capitalize', textDecoration: 'none', fontSize: '15px',
                  fontWeight: isActive ? '600' : '500', color: isActive ? '#4a5568' : '#a0aec0'
              })}>
                {path}
              </NavLink>
            ))}

            <div style={{display: 'flex', flexDirection: 'row', gap:'10px'}}>
              <button className="nav-btn" onClick={() => setIsHistoryOpen(true)}>History</button>
              <button className="nav-btn nav-btn-icon" onClick={() => setIsSettingsOpen(true)}>
                <Settings size={22} />
              </button>
              <button className="nav-btn nav-btn-icon" onClick={handleLogout}>
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </nav>
      </header>
      
      {/* Отрисовываем модалку здесь */}
      {isSettingsOpen && userId && (
        <SettingsModal 
          isModalOpen={isSettingsOpen}
          userId={userId}
          onClose={() => setIsSettingsOpen(false)}
          onSave={(newSettings) => {
          setUserSettings(newSettings);
          refreshData(); 
          setIsSettingsOpen(false);
  }}
        />
      )}
      
      <main className="main-content-container" style={{ flex: 1, padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <Outlet context={{ isHistoryOpen, setIsHistoryOpen, userSettings, setUserSettings, userId }} />
      </main>
    </div>
  );
};
import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";

export const MainLayout = () => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const location = useLocation();

  // Функция для определения, активна ли ссылка
  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div id="wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ 
        padding: '16px 40px', 
        borderBottom: '1px solid #edf2f7', 
        background: '#fff',
        position: 'sticky', top: 0, zIndex: 1000 
      }}>
        <nav style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#4a5568' }}>
            GradeMaster
          </div>

          <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            {['calculator', 'predictor', 'analytics'].map((path) => (
              <Link 
                key={path}
                to={`/${path}`} 
                style={{ 
                  textTransform: 'capitalize',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: isActive(path) ? '600' : '500',
                  color: isActive(path) ? '#4a5568' : '#a0aec0',
                  transition: 'color 0.2s'
                }}
              >
                {path}
              </Link>
            ))}
            
            <button 
              onClick={() => setIsHistoryOpen(true)}
              style={{ 
                cursor: 'pointer',
                fontSize: '15px',
                background: '#3b82f6',
                padding: '8px 20px',
                borderRadius: '10px',
                border: 'none',
                color: 'white',
                fontWeight: '600',
                marginLeft: '12px'
              }}
            >
              History
            </button>
          </div>
        </nav>
      </header>
      
      <main className="main-content-container" style={{ flex: 1, padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <Outlet context={{ isHistoryOpen, setIsHistoryOpen }} />
      </main>
    </div>
  );
};
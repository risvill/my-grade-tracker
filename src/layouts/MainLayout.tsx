import { useState } from "react";
import { Outlet, Link } from "react-router-dom";


export const MainLayout = () => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <div id="wrapper">
      <header style={{ padding: '20px 0', borderBottom: '1px solid var(--border-primary)' }}>
        <nav className="layout" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: 'var(--accent-primary)', fontSize: '24px' }}>GradeMaster</h1>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link style={{ color: 'var(--accent-primary)', fontSize: '15px' }} to="/calculator">Калькулятор</Link>
            <Link style={{ color: 'var(--accent-primary)', fontSize: '15px' }} to="/predictor">Предиктор</Link>
            {/* Кнопка истории теперь здесь */}
            <button onClick={() => setIsHistoryOpen(true)}>История</button>
          </div>
        </nav>
      </header>
      
      <main className="main-content-container" >
        <Outlet context={{ isHistoryOpen, setIsHistoryOpen }} />
      </main>
    </div>
  );
};
import { Link } from "react-router-dom";

export const Navbar = () => (
  <nav style={{ padding: '20px', borderBottom: '1px solid #ccc', display: 'flex', gap: '20px' }}>
    <Link to="/calculator">Калькулятор</Link>
    <Link to="/predictor">Предиктор</Link>
    {/* Добавим другие позже */}
  </nav>
);
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // твой файл инициализации Supabase
import styles from './AuthPage.module.scss'; // создай этот файл для стилей

export const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Проверьте почту для подтверждения регистрации!');
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }

    
  }
  

  return (
    <div className={styles.authContainer}>
      <form onSubmit={handleAuth} className={styles.authForm}>
        <h2>{isLogin ? 'Вход в систему' : 'Регистрация'}</h2>
        <input className='score-input2' type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
        <input className='score-input2' type="password" placeholder="Пароль" onChange={(e) => setPassword(e.target.value)} required />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
        </button>

        <p onClick={() => setIsLogin(!isLogin)} className={styles.toggle}>
          {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
        </p>
      </form>
    </div>
  );
};
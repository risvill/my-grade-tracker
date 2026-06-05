import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";
import type { Session } from '@supabase/supabase-js';
import { router } from "./utils/router"; 
import { AuthPage } from "./pages/AuthPage";
import { SubjectProvider } from "./utils/SubjectContext";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("App: проверка сессии...");
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("App: результат сессии:", session);
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("App: сессия изменилась:", session);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div>Загрузка системы...</div>;

  return !session ? (
    <AuthPage /> 
  ) : (
    // Оберни роутер в провайдер!
    <SubjectProvider>
      <RouterProvider router={router} />
    </SubjectProvider>
  );
}
import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export const RootLayout = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthenticated(!!session);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Загрузка...</div>;
  
  // Если не авторизован - кидаем на корень (App.tsx подхватит и покажет AuthPage)
  if (!authenticated) return <Navigate to="/" replace />;

  return <Outlet />;
};
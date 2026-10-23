import React, { useEffect, useState } from 'react';
import App from '@/App.jsx';
import AdminPage from '@/components/admin/AdminPage.jsx';
import { isAdminRoute } from '@/lib/admin-route.js';

const Root = () => {
  const [admin, setAdmin] = useState(() => isAdminRoute());
  useEffect(() => {
    const sync = () => setAdmin(isAdminRoute());
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);
  return admin ? <AdminPage /> : <App />;
};

export default Root;

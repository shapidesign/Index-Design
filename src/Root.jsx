import React, { useEffect, useState } from 'react';
import App from '@/App.jsx';
import AdminPage from '@/components/admin/AdminPage.jsx';

const isAdminHash = () => window.location.hash.startsWith('#/admin');

const Root = () => {
  const [admin, setAdmin] = useState(isAdminHash);
  useEffect(() => {
    const sync = () => setAdmin(isAdminHash());
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  return admin ? <AdminPage /> : <App />;
};

export default Root;

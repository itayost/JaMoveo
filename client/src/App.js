// client/src/App.js
import React from 'react';

import { useAuth } from './context/AuthContext';
import AppRoutes from './routes';

function App() {
  const { user, loading, login } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <AppRoutes 
        user={user} 
        loading={loading} 
        onLogin={login} 
      />
    </div>
  );
}

export default App;
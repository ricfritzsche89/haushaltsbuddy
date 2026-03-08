import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { startSyncListener } from './services/syncService';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TaskDetail from './pages/TaskDetail';
import Wall from './pages/Wall';
import Stats from './pages/Stats';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import Layout from './components/Layout';

function App() {
  const { currentUser, users } = useStore();

  useEffect(() => {
    // Start listening to Firebase sync events
    const unsubscribe = startSyncListener();
    return () => unsubscribe();
  }, []);

  // Apply dark mode class to html based on current user's settings
  useEffect(() => {
    if (currentUser && users[currentUser]?.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentUser, users]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={currentUser ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/task/:id" element={currentUser ? <TaskDetail /> : <Navigate to="/" />} />
          <Route path="/wall" element={currentUser ? <Wall /> : <Navigate to="/" />} />
          <Route path="/stats" element={currentUser ? <Stats /> : <Navigate to="/" />} />
          <Route path="/settings" element={currentUser ? <Settings /> : <Navigate to="/" />} />
          <Route path="/admin" element={currentUser === 'Ric' || currentUser === 'Nadine' ? <Admin /> : <Navigate to="/dashboard" />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;

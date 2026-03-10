import { useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { startSyncListener, loadMasterState, subscribeToMasterStateChanges } from './services/syncService';
import { Toaster } from 'react-hot-toast';
import { useReminderSystem } from './hooks/useReminderSystem';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TaskDetail from './pages/TaskDetail';
import Wall from './pages/Wall';
import Stats from './pages/Stats';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import Penalties from './pages/Penalties';
import Shop from './pages/Shop';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const { currentUser, users, checkUserTitles, migrateTylerToTayler } = useStore();
  useReminderSystem();

  // Ensure user has their base titles (0 XP) unlocked
  useEffect(() => {
    migrateTylerToTayler();
    if (currentUser) {
      checkUserTitles(currentUser);
    }
  }, [currentUser, checkUserTitles, migrateTylerToTayler]);

  // ── Core sync: load master state + start event listener + subscribe to master state changes
  const unsubMasterRef = useRef<(() => void) | null>(null);
  const unsubEventsRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const initSync = async () => {
      // 1. Load the latest master state snapshot on boot
      await loadMasterState();

      if (!isMounted) return;

      // 2. Subscribe to live master-state-document changes.
      //    This fires within ~1-2 seconds whenever another device saves its state.
      unsubMasterRef.current = subscribeToMasterStateChanges();

      // 3. Listen to incremental fine-grained events (add/update/delete actions).
      unsubEventsRef.current = startSyncListener(true);
    };

    initSync();

    return () => {
      isMounted = false;
      unsubMasterRef.current?.();
      unsubEventsRef.current?.();
    };
  }, []);

  // ── Re-sync master state whenever the user switches back to the app (e.g. from another tab / lock screen)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        console.log('[Sync] App back in foreground – refreshing master state...');
        await loadMasterState();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // ── Auto-reload when the PWA service worker has installed a new version
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[SW] New service worker activated – reloading page...');
        window.location.reload();
      });
    }
  }, []);

  // Midnight photo cleanup
  useEffect(() => {
    const { clearOldPhotos } = useStore.getState();
    clearOldPhotos(); // run once on load
    const scheduleNextMidnight = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setDate(midnight.getDate() + 1);
      midnight.setHours(0, 0, 10, 0); // 00:00:10 next day
      const msUntilMidnight = midnight.getTime() - Date.now();
      return setTimeout(() => {
        useStore.getState().clearOldPhotos();
        scheduleNextMidnight(); // reschedule for next midnight
      }, msUntilMidnight);
    };
    const timer = scheduleNextMidnight();
    return () => clearTimeout(timer);
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
    <ErrorBoundary>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route element={<Layout />}>
            <Route path="/dashboard" element={currentUser ? <Dashboard /> : <Navigate to="/" />} />
            <Route path="/task/:id" element={currentUser ? <TaskDetail /> : <Navigate to="/" />} />
            <Route path="/wall" element={currentUser ? <Wall /> : <Navigate to="/" />} />
            <Route path="/stats" element={currentUser ? <Stats /> : <Navigate to="/" />} />
            <Route path="/settings" element={currentUser ? <Settings /> : <Navigate to="/" />} />
            <Route path="/admin" element={currentUser && users[currentUser]?.role === 'admin' ? <Admin /> : <Navigate to="/dashboard" />} />
            <Route path="/penalties" element={currentUser ? <Penalties /> : <Navigate to="/" />} />
            <Route path="/shop" element={currentUser ? <Shop /> : <Navigate to="/" />} />
          </Route>
        </Routes>
        <Toaster position="top-center" />
      </HashRouter>
    </ErrorBoundary>
  );
}

export default App;

import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import A2HSPrompt from './A2HSPrompt';

export default function Layout() {
    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
            <main className="flex-1 overflow-y-auto w-full max-w-lg mx-auto bg-white dark:bg-slate-900 shadow-xl relative pb-20 pt-4 transition-colors">
                <Outlet />
            </main>
            <A2HSPrompt />
            <div className="fixed bottom-0 w-full max-w-lg left-1/2 -translate-x-1/2 z-50">
                <Navigation />
            </div>
        </div>
    );
}

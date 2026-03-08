import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

export default function Layout() {
    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
            <main className="flex-1 overflow-y-auto w-full max-w-lg mx-auto bg-white shadow-xl relative pb-20">
                <Outlet />
            </main>
            <div className="fixed bottom-0 w-full max-w-lg left-1/2 -translate-x-1/2 z-50">
                <Navigation />
            </div>
        </div>
    );
}

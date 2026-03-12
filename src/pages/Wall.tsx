import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { publishEvent } from '../services/syncService';
import { sendPushNotification } from '../services/ntfyService';
import { Send } from 'lucide-react';
import UserAvatar from '../components/UserAvatar';
import WallEntryCard from '../components/WallEntryCard';
import type { UserId } from '../types';

export default function Wall() {
    const { wallPosts, users, currentUser, addWallPost } = useStore();
    const [newPostText, setNewPostText] = useState('');

    if (!currentUser) return null;
    const me = users[currentUser];
    const isAdmin = Boolean(currentUser && users[currentUser]?.role === 'admin');

    const handlePost = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostText.trim()) return;

        const post = {
            id: Math.random().toString(36).substr(2, 9),
            userId: currentUser,
            text: newPostText.trim(),
            likes: [] as UserId[],
            comments: [],
            timestamp: Date.now()
        };

        addWallPost(post);
        publishEvent('WALL_POSTED', post);
        setNewPostText('');

        sendPushNotification({
            title: `📌 ${me.name} hat etwas gepostet`,
            message: post.text.length > 80 ? post.text.slice(0, 80) + '…' : post.text,
            priority: 3,
            tags: ['pushpin'],
            click: 'https://ricfritzsche89.github.io/haushaltsbuddy/#/wall'
        });
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative pb-4 transition-colors">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 px-6 pt-10 pb-4 shadow-sm sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800 transition-colors">
                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Pinnwand</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Familien Updates &amp; Nachrichten</p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                {/* Create Post */}
                <form onSubmit={handlePost} className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex gap-3 items-start transition-colors">
                    <UserAvatar user={me} size={40} className="flex-shrink-0 mt-1" />
                    <div className="flex-1">
                        <textarea
                            value={newPostText}
                            onChange={e => setNewPostText(e.target.value)}
                            placeholder="Was gibt's Neues?"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none h-20 transition-colors"
                        />
                        <div className="flex justify-end mt-2">
                            <button type="submit" disabled={!newPostText.trim()} className="bg-blue-600 text-white px-5 py-2 font-bold rounded-full text-sm shadow-md active:bg-blue-700 disabled:opacity-50 transition-transform active:scale-95 flex items-center gap-2">
                                <Send size={16} /> Posten
                            </button>
                        </div>
                    </div>
                </form>

                {/* Posts Feed */}
                <div className="space-y-4">
                    {wallPosts.length === 0 ? (
                        <div className="text-center text-slate-400 dark:text-slate-600 py-10">Noch keine Beiträge vorhanden.</div>
                    ) : (
                        [...wallPosts].sort((a, b) => b.timestamp - a.timestamp).map(post => (
                            <WallEntryCard
                                key={post.id}
                                post={post}
                                currentUser={currentUser}
                                isAdmin={isAdmin}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

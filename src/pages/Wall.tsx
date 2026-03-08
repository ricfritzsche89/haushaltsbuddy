import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { publishEvent } from '../services/syncService';
import { Heart, MessageCircle, Send } from 'lucide-react';

export default function Wall() {
    const { wallPosts, users, currentUser, addWallPost } = useStore();
    const [newPostText, setNewPostText] = useState('');

    const handlePost = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostText.trim() || !currentUser) return;

        const post = {
            id: Math.random().toString(36).substr(2, 9),
            userId: currentUser,
            text: newPostText.trim(),
            likes: [],
            comments: [],
            timestamp: Date.now()
        };

        addWallPost(post);
        publishEvent('WALL_POSTED', post);
        setNewPostText('');
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative pb-4">
            <div className="bg-white px-6 pt-10 pb-4 shadow-sm sticky top-0 z-10">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Pinnwand</h1>
                <p className="text-slate-500 font-medium mt-1">Familien Updates & Nachrichten</p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {/* Create Post */}
                <form onSubmit={handlePost} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white shadow-sm" style={{ backgroundColor: currentUser ? users[currentUser]?.color : '#ccc' }}>
                        {currentUser ? users[currentUser]?.name.charAt(0) : '?'}
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={newPostText}
                            onChange={e => setNewPostText(e.target.value)}
                            placeholder="Was gibt's Neues?"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none h-20"
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
                        <div className="text-center text-slate-400 py-10">Keine Beiträge vorhanden.</div>
                    ) : (
                        wallPosts.map(post => {
                            const author = users[post.userId];
                            return (
                                <div key={post.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm" style={{ backgroundColor: author?.color }}>
                                            {author?.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">{author?.name}</h4>
                                            <p className="text-xs text-slate-400">{new Date(post.timestamp).toLocaleString('de-DE', { hour: '2-digit', minute: '2-digit', weekday: 'short' })}</p>
                                        </div>
                                    </div>

                                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{post.text}</p>

                                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50 text-slate-400">
                                        <button className="flex items-center gap-1.5 text-xs font-semibold hover:text-red-500 transition-colors">
                                            <Heart size={16} /> {post.likes.length > 0 ? post.likes.length : 'Like'}
                                        </button>
                                        <button className="flex items-center gap-1.5 text-xs font-semibold hover:text-blue-500 transition-colors">
                                            <MessageCircle size={16} /> {post.comments.length > 0 ? post.comments.length : 'Kommentieren'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

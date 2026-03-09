import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { publishEvent } from '../services/syncService';
import { sendPushNotification } from '../services/ntfyService';
import { Heart, MessageCircle, Send, Trash2, Pencil, Check, X, SmilePlus } from 'lucide-react';
import UserAvatar from './UserAvatar';
import type { WallPost, UserId } from '../types';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface WallEntryCardProps {
    post: WallPost;
    currentUser: UserId;
    isAdmin: boolean;
}

const AVAILABLE_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👀', '🎉'];

export default function WallEntryCard({ post, currentUser, isAdmin }: WallEntryCardProps) {
    const { users, likePost, addWallComment, deleteWallPost, updateWallPost, addWallReaction } = useStore();

    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(post.text);
    const [showReactionPicker, setShowReactionPicker] = useState(false);

    const author = users[post.userId];
    const me = users[currentUser];
    const isLiked = post.likes.includes(currentUser);

    const handleLike = () => {
        const alreadyLiked = post.likes.includes(currentUser);
        likePost(post.id, currentUser);
        publishEvent('WALL_LIKED', { postId: post.id, userId: currentUser });

        if (!alreadyLiked && post.userId !== currentUser) {
            sendPushNotification({
                title: `❤️ Pinnwand: Like von ${me.name}`,
                message: `"${post.text.slice(0, 60)}…"`,
                priority: 5,
                tags: ['heart'],
                click: 'https://ricfritzsche89.github.io/haushaltsbuddy/#/wall'
            });
        }
    };

    const handleReaction = (emoji: string) => {
        addWallReaction(post.id, currentUser, emoji);
        publishEvent('WALL_REACTED', { postId: post.id, userId: currentUser, emoji });
        setShowReactionPicker(false);
    };

    const handleComment = (e: React.FormEvent) => {
        e.preventDefault();
        const text = commentText.trim();
        if (!text) return;

        const comment = {
            id: Math.random().toString(36).substr(2, 9),
            userId: currentUser,
            text,
            timestamp: Date.now()
        };

        addWallComment(post.id, comment);
        publishEvent('WALL_COMMENTED', { postId: post.id, comment });
        setCommentText('');

        if (post.userId !== currentUser) {
            sendPushNotification({
                title: `💬 Pinnwand: Kommentar von ${me.name}`,
                message: `"${text.length > 80 ? text.slice(0, 80) + '…' : text}"`,
                priority: 5,
                tags: ['speech_balloon'],
                click: 'https://ricfritzsche89.github.io/haushaltsbuddy/#/wall'
            });
        }
    };

    const handleDelete = () => {
        if (!window.confirm('Post wirklich löschen?')) return;
        deleteWallPost(post.id);
        publishEvent('WALL_DELETED', { postId: post.id });
        toast.success('Post gelöscht');
    };

    const saveEdit = () => {
        if (!editText.trim()) return;
        updateWallPost(post.id, { text: editText.trim() });
        publishEvent('WALL_UPDATED', { postId: post.id, updates: { text: editText.trim() } });
        setIsEditing(false);
        toast.success('Post bearbeitet ✏️');
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
            {/* Post header */}
            <div className="flex items-center gap-3 px-5 pt-5 pb-3">
                <UserAvatar user={author} size={40} />
                <div className="flex-1">
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">{author?.name}</h4>
                    <p className="text-xs text-slate-400">
                        {new Date(post.timestamp).toLocaleString('de-DE', { hour: '2-digit', minute: '2-digit', weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                </div>
                {isAdmin && (
                    <div className="flex gap-1">
                        <button onClick={() => setIsEditing(true)} className="p-2 rounded-full text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                            <Pencil size={15} />
                        </button>
                        <button onClick={handleDelete} className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <Trash2 size={15} />
                        </button>
                    </div>
                )}
            </div>

            {/* Post text / edit */}
            {isEditing ? (
                <div className="px-5 pb-4 space-y-2">
                    <textarea
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-blue-300 dark:border-blue-600 dark:text-white rounded-2xl px-4 py-3 text-sm focus:outline-none resize-none h-24"
                        autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                        <button onClick={() => setIsEditing(false)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold">
                            <X size={14} /> Abbrechen
                        </button>
                        <button onClick={saveEdit} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold">
                            <Check size={14} /> Speichern
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap px-5 pb-4">{post.text}</p>
            )}

            {/* Reactions Display */}
            {post.reactions && Object.keys(post.reactions).length > 0 && (
                <div className="px-5 pb-2 flex flex-wrap gap-1.5">
                    {Object.entries(post.reactions).map(([emoji, userIds]) => {
                        const hasReacted = userIds.includes(currentUser);
                        return (
                            <button
                                key={emoji}
                                onClick={() => handleReaction(emoji)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border transition-colors ${hasReacted
                                        ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300'
                                        : 'bg-slate-50 border-slate-100 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                                    }`}
                            >
                                <span>{emoji}</span>
                                <span>{userIds.length}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Action bar */}
            <div className="flex items-center gap-4 px-5 py-3 border-t border-slate-100 dark:border-slate-800 relative">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 text-sm font-semibold transition-all active:scale-90 ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}
                >
                    <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                    {post.likes.length > 0 && <span>{post.likes.length}</span>}
                    {post.likes.length === 0 && <span className="text-xs">Gefällt mir</span>}
                </button>

                <div className="relative">
                    <button
                        onClick={() => setShowReactionPicker(!showReactionPicker)}
                        className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-amber-500 transition-colors ml-2"
                    >
                        <SmilePlus size={18} />
                    </button>

                    <AnimatePresence>
                        {showReactionPicker && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                className="absolute bottom-full left-0 mb-2 bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 rounded-full py-2 px-3 flex gap-1 z-20"
                            >
                                {AVAILABLE_REACTIONS.map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => handleReaction(emoji)}
                                        className="w-8 h-8 flex items-center justify-center text-xl hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-transform hover:scale-110"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button
                    onClick={() => setShowComments(!showComments)}
                    className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ml-auto ${showComments ? 'text-blue-500' : 'text-slate-400 hover:text-blue-400'}`}
                >
                    <MessageCircle size={18} />
                    {post.comments.length > 0 && <span>{post.comments.length}</span>}
                    {post.comments.length === 0 && <span className="text-xs">Kommentare</span>}
                </button>
            </div>

            {/* Who liked it */}
            {post.likes.length > 0 && (
                <div className="flex items-center gap-1 px-5 pb-2">
                    {post.likes.slice(0, 5).map(uid => (
                        <UserAvatar key={uid} user={users[uid]} size={18} />
                    ))}
                    {post.likes.length > 5 && <span className="text-xs text-slate-400 ml-1">+{post.likes.length - 5}</span>}
                </div>
            )}

            {/* Comments */}
            {showComments && (
                <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-4 space-y-3 border-t border-slate-100 dark:border-slate-800">
                    {post.comments.map(c => {
                        const cu = users[c.userId];
                        return (
                            <div key={c.id} className="flex gap-3">
                                <UserAvatar user={cu} size={30} className="flex-shrink-0 mt-0.5" />
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none flex-1 border border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300">
                                    <span className="font-bold text-xs block mb-0.5" style={{ color: cu?.color }}>{cu?.name}</span>
                                    {c.text}
                                </div>
                            </div>
                        );
                    })}

                    <form onSubmit={handleComment} className="flex gap-2 pt-1">
                        <UserAvatar user={me} size={30} className="flex-shrink-0 mt-1" />
                        <input
                            type="text"
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            placeholder="Schreibe einen Kommentar…"
                            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                        <button type="submit" disabled={!commentText.trim()} className="bg-blue-600 text-white p-2 rounded-full disabled:opacity-40 active:bg-blue-700 transition active:scale-90">
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

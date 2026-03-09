import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';
import { publishEvent } from '../services/syncService';

interface Props {
    cropSrc: string;
    onClose: () => void;
}

export default function AvatarCropModal({ cropSrc, onClose }: Props) {
    const { currentUser, updateUserProfile } = useStore();
    const [isUploading, setIsUploading] = useState(false);
    const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
    const cropStartRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
    const cropImgRef = useRef<HTMLImageElement | null>(null);

    if (!currentUser) return null;

    const startCropDrag = (e: React.TouchEvent | React.MouseEvent) => {
        const pt = 'touches' in e ? e.touches[0] : e;
        cropStartRef.current = { x: pt.clientX, y: pt.clientY, ox: cropOffset.x, oy: cropOffset.y };
    };

    const moveCropDrag = (e: React.TouchEvent | React.MouseEvent) => {
        if (!cropStartRef.current) return;
        const pt = 'touches' in e ? e.touches[0] : e;
        const dx = pt.clientX - cropStartRef.current.x;
        const dy = pt.clientY - cropStartRef.current.y;
        setCropOffset({ x: cropStartRef.current.ox + dx, y: cropStartRef.current.oy + dy });
    };

    const endCropDrag = () => { cropStartRef.current = null; };

    const confirmCrop = async () => {
        if (!cropImgRef.current) return;
        setIsUploading(true);
        const toastId = toast.loading('Speichere Profilbild...');
        try {
            const size = 400;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d')!;
            const img = cropImgRef.current;

            // Scale factor: preview container is 224px (w-56)
            const scaleX = img.naturalWidth / img.width;
            const scaleY = img.naturalHeight / img.height;
            const srcX = (-cropOffset.x) * scaleX;
            const srcY = (-cropOffset.y) * scaleY;
            const srcSize = Math.min(img.naturalWidth, img.naturalHeight);

            ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, size, size);
            const base64 = canvas.toDataURL('image/jpeg', 0.8);

            updateUserProfile(currentUser, { avatarUrl: base64 });
            publishEvent('USER_PROFILE_UPDATED', { userId: currentUser, updates: { avatarUrl: base64 } });
            toast.success('Profilbild gespeichert! 📸', { id: toastId });
            onClose();
        } catch {
            toast.error('Fehler beim Speichern.', { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center gap-4 p-6">
            <p className="text-white font-bold text-lg text-center">Ziehe das Bild um den Ausschnitt zu wählen</p>
            <div className="w-56 h-56 rounded-full overflow-hidden border-4 border-white shadow-2xl cursor-grab active:cursor-grabbing relative"
                onMouseDown={startCropDrag} onMouseMove={moveCropDrag} onMouseUp={endCropDrag}
                onTouchStart={startCropDrag} onTouchMove={moveCropDrag} onTouchEnd={endCropDrag}
            >
                <img
                    ref={cropImgRef}
                    src={cropSrc}
                    alt="crop"
                    className="absolute max-w-none pointer-events-none select-none"
                    style={{ transform: `translate(${cropOffset.x}px, ${cropOffset.y}px)`, width: '100%', minWidth: '100%' }}
                    draggable={false}
                />
            </div>
            <div className="flex gap-4 mt-2">
                <button onClick={confirmCrop} disabled={isUploading} className="bg-green-500 text-white font-bold px-8 py-3 rounded-2xl active:scale-95 transition">✓ Speichern</button>
                <button onClick={onClose} className="bg-slate-700 text-white font-bold px-8 py-3 rounded-2xl active:scale-95 transition">Abbrechen</button>
            </div>
        </div>
    );
}

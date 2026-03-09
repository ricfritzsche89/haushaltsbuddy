import type { UserProfile } from '../types';

interface Props {
    user: UserProfile | undefined | null;
    size?: number; // px, default 40
    className?: string;
}

/** Shows avatar photo if set, otherwise colored initial letter */
export default function UserAvatar({ user, size = 40, className = '' }: Props) {
    if (!user) return (
        <div className={`rounded-full bg-slate-300 flex items-center justify-center text-white font-bold ${className}`}
            style={{ width: size, height: size, fontSize: size * 0.4 }}>?</div>
    );

    return (
        <div
            className={`rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-white ${className}`}
            style={{
                width: size,
                height: size,
                backgroundColor: user.avatarUrl ? 'transparent' : user.color,
                fontSize: size * 0.4,
                border: `2px solid ${user.color}`,
            }}
        >
            {user.avatarUrl
                ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                : user.name.charAt(0)
            }
        </div>
    );
}

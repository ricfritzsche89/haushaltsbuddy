import { NavLink } from 'react-router-dom';
import { Calendar, MessageSquare, BarChart2, Shield, SmartphoneNfc, Store } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';

export default function Navigation() {
  const currentUser = useStore(state => state.currentUser);
  const users = useStore(state => state.users);
  const userObj = currentUser ? users[currentUser] : null;

  if (!currentUser) return null;

  const navItems = [
    { to: '/dashboard', icon: Calendar, label: 'Plan' },
    { to: '/wall', icon: MessageSquare, label: 'Pinnwand' },
    { to: '/shop', icon: Store, label: 'Shop' },
    { to: '/stats', icon: BarChart2, label: 'Stats' },
    { to: '/penalties', icon: SmartphoneNfc, label: 'Verbot' },
  ];

  if (currentUser && users[currentUser]?.role === 'admin') {
    navItems.push({ to: '/admin', icon: Shield, label: 'Admin' });
  }

  return (
    <nav className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-6 py-3 flex justify-between items-center rounded-t-3xl shadow-[0_-4px_25px_-5px_rgba(0,0,0,0.1)] select-none transition-colors">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition-colors relative px-4 py-2 ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute -top-3 w-1.5 h-1.5 rounded-full bg-blue-600"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </>
          )}
        </NavLink>
      ))}

      {/* User Avatar Mini Container -> Navigates to Settings */}
      <NavLink to="/settings" className="flex flex-col items-center gap-1 cursor-pointer transition-transform active:scale-95">
        <div
          className="w-8 h-8 rounded-full border-2 shadow-sm flex items-center justify-center font-bold text-xs"
          style={{ borderColor: userObj?.color, backgroundColor: `${userObj?.color}20`, color: userObj?.color }}
        >
          {userObj?.avatarUrl ? (
            <img src={userObj.avatarUrl} alt={userObj.name} className="w-full h-full object-cover rounded-full" />
          ) : (
            userObj?.name.charAt(0)
          )}
        </div>
        <span className="text-[10px] font-medium tracking-wide text-slate-400">Profil</span>
      </NavLink>
    </nav>
  );
}

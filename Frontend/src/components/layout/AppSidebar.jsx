import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Server,
  Package,
  ShoppingCart,
  History,
  UserCog,
  User,
  ChevronLeft,
  ChevronRight,
  Activity,
  CalendarDays,
  Siren,
  Globe,
  Sparkles,
  Shield,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Hospitals', path: '/hospitals', icon: Building2 },
  { label: 'Rooms', path: '/rooms', icon: DoorOpen },
  { label: 'Racks', path: '/racks', icon: Server },
  { label: 'Bins', path: '/bins', icon: Package },
  { label: 'Emergency', path: '/emergency', icon: Siren },
  { label: 'Global Inventory', path: '/inventory-map', icon: Globe },
  { label: 'Shop', path: '/shop', icon: ShoppingCart },
  { label: 'Critical Logs', path: '/critical-logs', icon: Shield },
  { label: 'History', path: '/history', icon: History },
];

const adminItems = [
  { label: 'Nurse Management', path: '/nurses', icon: UserCog },
  { label: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingCart },
  { label: 'Leave Management', path: '/leaves', icon: CalendarDays },
  { label: 'Hospital Matcher', path: '/hospital-matcher', icon: Sparkles },
];

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium sidebar-transition ${
      isActive(path)
        ? 'bg-primary text-primary-foreground shadow-md'
        : 'text-[hsl(var(--sidebar-fg))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-white'
    }`;

  return (
    <aside
      className={`${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      } bg-[hsl(var(--sidebar-bg))] min-h-screen flex flex-col sidebar-transition relative`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6">
        <Activity className="h-8 w-8 text-primary shrink-0" />
        {!collapsed && (
          <span className="text-white font-bold text-xl tracking-tight">INVORA</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'} className={linkClass(item.path)}>
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className={`pt-4 pb-2 ${collapsed ? 'px-2' : 'px-4'}`}>
              {!collapsed && <p className="text-xs uppercase tracking-wider text-[hsl(var(--sidebar-fg))] opacity-60">Admin</p>}
            </div>
            {adminItems.map(item => (
              <NavLink key={item.path} to={item.path} className={linkClass(item.path)}>
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Profile link */}
      <div className="px-3 pb-4">
        <NavLink to="/profile" className={linkClass('/profile')}>
          <User className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Profile</span>}
        </NavLink>
      </div>
      

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:bg-secondary"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}

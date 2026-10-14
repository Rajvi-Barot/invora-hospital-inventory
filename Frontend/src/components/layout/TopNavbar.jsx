import { useState, useEffect } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useEmergency } from '@/contexts/EmergencyContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LogOut, ShoppingCart, Bell, Siren, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import axios from 'axios';

export default function TopNavbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { criticalCount, pendingCount } = useEmergency();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);

  // ✅ Fetch alerts every 5 seconds
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // const res = await axios.get("http://localhost:3000/api/v1/alerts");
        const res = await axios.get("https://invora-qkwq.onrender.com/api/v1/alerts");
        // setAlerts(res.data.alerts);
        const allAlerts = res.data.alerts;

        if (user?.role === "admin") {
          setAlerts(allAlerts); // admin sees everything
        } else {
          // nurse sees only UNSAFE alerts
          const nurseAlerts = allAlerts.filter(
            alert => alert.type === "UNSAFE"
          );
          setAlerts(nurseAlerts);
        }
      } catch (err) {}
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (id) => {
    try {
      // await axios.patch(`http://localhost:3000/api/v1/alerts/${id}/resolve`);
      await axios.patch(`https://invora-qkwq.onrender.com/api/v1/alerts/${id}/resolve`);
      setAlerts(prev => prev.filter(a => a._id !== id));
    } catch (err) {}
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      <div />

      <div className="flex items-center gap-4">
        {/* Emergency Alert Banner */}
        {criticalCount > 0 && (
          <button
            onClick={() => navigate('/emergency')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/30 hover:bg-destructive/20 transition-colors cursor-pointer animate-pulse"
          >
            <Siren className="h-4 w-4 text-destructive" />
            <span className="text-xs font-bold text-destructive">
              {criticalCount} CRITICAL
            </span>
          </button>
        )}

        {/* Pending requests indicator */}
        {pendingCount > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate('/emergency')}
            title={`${pendingCount} pending emergency requests`}
          >
            <Siren className="h-5 w-5 text-destructive" />
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">
              {pendingCount}
            </span>
          </Button>
        )}

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>

        {/* Cart */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => navigate('/shop/cart')}
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </Button>

        {/* 🔔 Admin Bell */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(!open)}
          >
            <Bell className="h-5 w-5" />
          </Button>

          {/* Red Dot */}
          {alerts.length > 0 && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full" />
          )}

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg p-3 space-y-2 z-50 max-h-80 overflow-y-auto">
              <p className="text-sm font-semibold">Notifications</p>

              {alerts.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No notifications
                </p>
              )}

              {alerts.map(alert => (
                <div
                  key={alert._id}
                  onClick={() => handleResolve(alert._id)}
                  className={`text-xs p-2 rounded cursor-pointer hover:bg-secondary ${
                    alert.type === "UNSAFE"
                      ? "text-destructive"
                      : "text-foreground"
                  }`}
                >
                  {alert.message}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-border" />
        {/* <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('/shop/cart')}>
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </Button>

        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button> */}

        <div className="h-8 w-px bg-border" />

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            {user?.name.charAt(0)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <Badge variant="secondary" className="mt-1 text-[10px] capitalize">{user?.role}</Badge>
          </div>
        </div>

        {/* <Button variant="ghost" size="icon" onClick={logout} title="Logout">
          <LogOut className="h-5 w-5 text-muted-foreground" />
        </Button> */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
    </header>
  );
}

// import { useState, useEffect } from "react";
// import { useAuth } from '@/contexts/AuthContext';
// import { useCart } from '@/contexts/CartContext';
// import { LogOut, ShoppingCart, Bell } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import axios from 'axios';

// export default function TopNavbar() {
//   const { user, logout } = useAuth();
//   const { totalItems } = useCart();
//   const navigate = useNavigate();

  // const [open, setOpen] = useState(false);
  // const [alerts, setAlerts] = useState([]);

  // // ✅ Fetch alerts every 5 seconds
  // useEffect(() => {
  //   const fetchAlerts = async () => {
  //     try {
  //       const res = await axios.get("http://localhost:3000/api/v1/alerts");
  //       // setAlerts(res.data.alerts);
  //       const allAlerts = res.data.alerts;

  //       if (user?.role === "admin") {
  //         setAlerts(allAlerts); // admin sees everything
  //       } else {
  //         // nurse sees only UNSAFE alerts
  //         const nurseAlerts = allAlerts.filter(
  //           alert => alert.type === "UNSAFE"
  //         );
  //         setAlerts(nurseAlerts);
  //       }
  //     } catch (err) {}
  //   };

  //   fetchAlerts();
  //   const interval = setInterval(fetchAlerts, 5000);

  //   return () => clearInterval(interval);
  // }, []);

  // const handleResolve = async (id) => {
  //   try {
  //     await axios.patch(`http://localhost:3000/api/v1/alerts/${id}/resolve`);
  //     setAlerts(prev => prev.filter(a => a._id !== id));
  //   } catch (err) {}
  // };

  // const handleLogout = () => {
  //   logout();
  //   navigate("/login", { replace: true });
  // };

//   return (
//     <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
//       <div />

//       <div className="flex items-center gap-4">
//         {/* Cart */}
        // <Button
        //   variant="ghost"
        //   size="icon"
        //   className="relative"
        //   onClick={() => navigate('/shop/cart')}
        // >
        //   <ShoppingCart className="h-5 w-5" />
        //   {totalItems > 0 && (
        //     <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">
        //       {totalItems}
        //     </span>
        //   )}
        // </Button>

        // {/* 🔔 Admin Bell */}
        // <div className="relative">
        //   <Button
        //     variant="ghost"
        //     size="icon"
        //     onClick={() => setOpen(!open)}
        //   >
        //     <Bell className="h-5 w-5" />
        //   </Button>

        //   {/* Red Dot */}
        //   {alerts.length > 0 && (
        //     <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full" />
        //   )}

        //   {/* Dropdown */}
        //   {open && (
        //     <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg p-3 space-y-2 z-50 max-h-80 overflow-y-auto">
        //       <p className="text-sm font-semibold">Notifications</p>

        //       {alerts.length === 0 && (
        //         <p className="text-xs text-muted-foreground">
        //           No notifications
        //         </p>
        //       )}

        //       {alerts.map(alert => (
        //         <div
        //           key={alert._id}
        //           onClick={() => handleResolve(alert._id)}
        //           className={`text-xs p-2 rounded cursor-pointer hover:bg-secondary ${
        //             alert.type === "UNSAFE"
        //               ? "text-destructive"
        //               : "text-foreground"
        //           }`}
        //         >
        //           {alert.message}
        //         </div>
        //       ))}
        //     </div>
        //   )}
        // </div>

        // <div className="h-8 w-px bg-border" />

//         {/* User */}
//         <div className="flex items-center gap-3">
//           <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
//             {user?.name.charAt(0)}
//           </div>
//           <div className="hidden sm:block">
//             <p className="text-sm font-medium leading-none">
//               {user?.name}
//             </p>
//             <Badge variant="secondary" className="mt-1 text-[10px] capitalize">
//               {user?.role}
//             </Badge>
//           </div>
//         </div>

      //   <Button
      //     variant="ghost"
      //     size="icon"
      //     onClick={handleLogout}
      //     title="Logout"
      //   >
      //     <LogOut className="h-5 w-5 text-muted-foreground" />
      //   </Button>
      // </div>
//     </header>
//   );
// }
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { EmergencyProvider } from "./contexts/EmergencyContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Hospitals from "./pages/Hospitals";
import Rooms from "./pages/Rooms";
import Racks from "./pages/Racks";
import Bins from "./pages/Bins";

import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";

import HistoryPage from "./pages/HistoryPage";
import Nurses from "./pages/Nurses";
import Profile from "./pages/Profile";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Logout from "./pages/Logout";

import LeaveManagement from "./pages/LeaveManagement";
import PurchaseOrders from "./pages/PurchaseOrders";

import IncomingRequests from "./pages/IncomingRequests";
import EmergencyRequests from "./pages/EmergencyRequests";
import GlobalInventoryMap from "./pages/GlobalInventoryMap";

import ResetPassword from "./pages/ResetPassword";
import HospitalMatcher from "./pages/HospitalMatcher";
import CriticalLogs from "./pages/CriticalLogs";

import ErrorBoundary from "./pages/ErrorBoundary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <EmergencyProvider>
              <ErrorBoundary>
                <BrowserRouter>

                  <Toaster />
                  <Sonner />

                  <Routes>

                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/logout" element={<Logout />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route element={<MainLayout />}>

                        {/* Dashboard */}
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dashboard" element={<Dashboard />} />

                        {/* Core */}
                        <Route path="/hospitals" element={<Hospitals />} />
                        <Route path="/rooms" element={<Rooms />} />
                        <Route path="/racks" element={<Racks />} />
                        <Route path="/bins" element={<Bins />} />

                        {/* Shop */}
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/shop/cart" element={<Cart />} />
                        <Route path="/shop/checkout" element={<Checkout />} />
                        <Route path="/shop/success" element={<OrderSuccess />} />

                        {/* Management */}
                        <Route path="/history" element={<HistoryPage />} />
                        <Route path="/nurses" element={<Nurses />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/leaves" element={<LeaveManagement />} />
                        <Route path="/purchase-orders" element={<PurchaseOrders />} />

                        {/* Emergency */}
                        <Route path="/emergency" element={<EmergencyRequests />} />
                        <Route path="/incoming-requests" element={<IncomingRequests />} />
                        <Route path="/inventory-map" element={<GlobalInventoryMap />} />

                        {/* Other */}
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/hospital-matcher" element={<HospitalMatcher />} />
                        <Route path="/critical-logs" element={<CriticalLogs />} />

                      </Route>
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<NotFound />} />

                  </Routes>

                </BrowserRouter>
              </ErrorBoundary>
            </EmergencyProvider>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { AuthProvider } from "./contexts/AuthContext";
// import { CartProvider } from "./contexts/CartContext";
// import { EmergencyProvider } from "./contexts/EmergencyContext";
// import MainLayout from "./components/layout/MainLayout";
// import Dashboard from "./pages/Dashboard";
// import Hospitals from "./pages/Hospitals";
// import Rooms from "./pages/Rooms";
// import Racks from "./pages/Racks";
// import Bins from "./pages/Bins";
// import Shop from "./pages/Shop";
// import Cart from "./pages/Cart";
// import Checkout from "./pages/Checkout";
// import OrderSuccess from "./pages/OrderSuccess";
// import HistoryPage from "./pages/HistoryPage";
// import Nurses from "./pages/Nurses";
// import Profile from "./pages/Profile";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Logout from "./pages/Logout";
// import ProtectedRoute from "./components/ProtectedRoute";
// import LeaveManagement from "./pages/LeaveManagement";
// import PurchaseOrders from "./pages/PurchaseOrders";
// import IncomingRequests from "./pages/IncomingRequests";
// import EmergencyRequests from "./pages/EmergencyRequests";
// import GlobalInventoryMap from "./pages/GlobalInventoryMap";
// import ResetPassword from "./pages/ResetPassword";
// import { ThemeProvider } from "./contexts/ThemeContext";
// import HospitalMatcher from "./pages/HospitalMatcher";
// import CriticalLogs from "./pages/CriticalLogs";
// import ErrorBoundary from "./pages/ErrorBoundary";
// import NotFound from "./pages/NotFound";

// const queryClient = new QueryClient();

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <ThemeProvider>
//       <AuthProvider>
//         <CartProvider>
//           <TooltipProvider>
//             <EmergencyProvider>
//               <ErrorBoundary>
//                 <BrowserRouter>
//                   <Toaster />
//                   <Sonner />
//                   <Routes>
//                     <Route path="/login" element={<Login />} />
//                     <Route path="/register" element={<Register />} />
//                     <Route path="/logout" element={<Logout />} />

//                     <Route element={<ProtectedRoute />}>
//                       <Route element={<MainLayout />}>
//                         {/* <Route path="/" element={<Dashboard />} /> */}
//                         <Route path="/dashboard" element={<Dashboard />} />
//                         <Route path="/hospitals" element={<Hospitals />} />
//                         <Route path="/rooms" element={<Rooms />} />
//                         <Route path="/racks" element={<Racks />} />
//                         <Route path="/bins" element={<Bins />} />
//                         <Route path="/shop" element={<Shop />} />
//                         <Route path="/shop/cart" element={<Cart />} />
//                         <Route path="/shop/checkout" element={<Checkout />} />
//                         <Route path="/shop/success" element={<OrderSuccess />} />
//                         <Route path="/history" element={<HistoryPage />} />
//                         <Route path="/nurses" element={<Nurses />} />
//                         <Route path="/profile" element={<Profile />} />
//                         <Route path="/leaves" element={<LeaveManagement />} />
//                         <Route path="/purchase-orders" element={<PurchaseOrders />} />
//                         <Route path="/emergency" element={<EmergencyRequests />} />
//                         <Route path="/inventory-map" element={<GlobalInventoryMap />} />
//                         <Route path="/incoming-requests" element={<IncomingRequests />} />
//                         <Route path="/reset-password" element={<ResetPassword />} />
//                         <Route path="/" element={<Dashboard />} />
//                         <Route path="/emergency" element={<EmergencyRequests />} />
//                         <Route path="/inventory-map" element={<GlobalInventoryMap />} />
//                         <Route path="/hospital-matcher" element={<HospitalMatcher />} />
//                         <Route path="/critical-logs" element={<CriticalLogs />} />
//                       </Route>
//                     </Route>

//                   <Route path="*" element={<NotFound />} />
//                 </Routes>
//                 </BrowserRouter>
//               </ErrorBoundary>
//             </EmergencyProvider>
//           </TooltipProvider>
//         </CartProvider>
//       </AuthProvider>
//     </ThemeProvider>
//   </QueryClientProvider>
// );

// export default App;
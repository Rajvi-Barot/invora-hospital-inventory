import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import TopNavbar from "./TopNavbar";

export default function MainLayout() {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <TopNavbar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />   {/* 🔥 THIS IS IMPORTANT */}
        </main>
      </div>
    </div>
  );
}

// import { Outlet } from 'react-router-dom';
// import AppSidebar from './AppSidebar';
// import TopNavbar from './TopNavbar';

// export default function MainLayout() {
//   return (
//     <div className="flex min-h-screen w-full">
//       <AppSidebar />
//       <div className="flex-1 flex flex-col min-w-0">
//         <TopNavbar />
//         <main className="flex-1 p-6 overflow-auto">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }

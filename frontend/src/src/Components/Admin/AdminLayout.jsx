import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Client-side route protection
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex bg-[#05010d] min-h-screen text-white">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          {/* Children routes will render here */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

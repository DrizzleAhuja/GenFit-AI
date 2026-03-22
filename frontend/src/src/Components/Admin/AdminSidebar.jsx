import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart2, Users, FileText, MessageSquare, LifeBuoy, LogOut } from 'lucide-react';

const AdminSidebar = () => {
  const links = [
    { title: 'Dashboard', path: '/admin/dashboard', icon: <BarChart2 size={20} /> },
    { title: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { title: 'Audit Trail', path: '/admin/audit', icon: <FileText size={20} /> },
    { title: 'Feedback', path: '/admin/feedback', icon: <MessageSquare size={20} /> },
    { title: 'User Support', path: '/admin/support', icon: <LifeBuoy size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    window.location.href = "/";
  };

  return (
    <div className="h-screen w-64 bg-[#05010d] border-r border-purple-500/20 text-white flex flex-col p-4 shadow-[0_0_25px_rgba(139,92,246,0.15)] z-50">
      <div className="flex items-center gap-2 px-2 py-4 border-b border-purple-500/20 mb-6 font-bold">
        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold">A</div>
        <span className="text-xl font-bold bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">GenFit Admin</span>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all border border-transparent ${
                isActive
                  ? 'bg-[#8B5CF6]/15 text-[#22D3EE] border-[#22D3EE]/30 shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white hover:border-purple-500/10'
              }`
            }
          >
            {link.icon}
            <span className="font-medium">{link.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-purple-500/20 pt-4 flex flex-col gap-2">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 hover:text-red-500 transition-all w-full text-left border border-transparent hover:border-red-500/20"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;



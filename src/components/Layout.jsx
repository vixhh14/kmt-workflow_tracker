import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Monitor, CheckSquare, Briefcase, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Check if we're on a role-specific dashboard
    const isRoleDashboard = location.pathname.startsWith('/dashboard/');

    // Navigation items - Outsource only visible to admin and planning
    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/users', label: 'Users', icon: Users },
        { path: '/machines', label: 'Machines', icon: Monitor },
        { path: '/tasks', label: 'Tasks', icon: CheckSquare },
        // Outsource only for admin and planning
        ...(user?.role === 'admin' || user?.role === 'planning'
            ? [{ path: '/outsource', label: 'Outsource', icon: Briefcase }]
            : []),
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar - Only show for generic routes, not role-specific dashboards */}
            {!isRoleDashboard && (
                <div className="w-64 bg-white shadow-md">
                    <div className="p-4 border-b">
                        <h1 className="text-xl font-bold text-blue-600">Workflow Tracker</h1>
                        <p className="text-xs text-gray-500 mt-1">{user?.role || 'User'}</p>
                    </div>
                    <nav className="p-4 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">
                            {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                        </h2>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{user?.username || 'User'}</p>
                                <p className="text-xs text-gray-500">{user?.email || ''}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                                <LogOut size={18} />
                                <span className="text-sm">Logout</span>
                            </button>
                        </div>
                    </div>
                </header>
                <main className="p-6">
                    {children || <Outlet />}
                </main>
            </div>
        </div>
    );
};

export default Layout;

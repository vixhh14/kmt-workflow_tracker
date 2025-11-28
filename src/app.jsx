import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout';
import Login from './pages/Login.jsx';

// Dashboards
import AdminDashboard from './pages/dashboards/AdminDashboard.jsx';
import OperatorDashboard from './pages/dashboards/OperatorDashboard.jsx';
import SupervisorDashboard from './pages/dashboards/SupervisorDashboard.jsx';
import PlanningDashboard from './pages/dashboards/PlanningDashboard.jsx';

// Pages
import Dashboard from './pages/Dashboard.jsx';
import Users from './pages/Users.jsx';
import Machines from './pages/Machines.jsx';
import Tasks from './pages/Tasks.jsx';
import Outsource from './pages/Outsource.jsx';
import Signup from './pages/Signup.jsx';
import SignupSkills from './pages/SignupSkills.jsx';
import UserApprovals from './pages/admin/UserApprovals.jsx';

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login />} />

                {/* Role-based Dashboards */}
                <Route path="/dashboard/admin" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <Layout><AdminDashboard /></Layout>
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/operator" element={
                    <ProtectedRoute allowedRoles={['operator']}>
                        <Layout><OperatorDashboard /></Layout>
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/supervisor" element={
                    <ProtectedRoute allowedRoles={['supervisor']}>
                        <Layout><SupervisorDashboard /></Layout>
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/planning" element={
                    <ProtectedRoute allowedRoles={['planning']}>
                        <Layout><PlanningDashboard /></Layout>
                    </ProtectedRoute>
                } />

                {/* Protected Routes */}
                <Route path="/" element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Dashboard />} />
                    {/* Users page - Only accessible by admin */}
                    <Route path="users" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Users />
                        </ProtectedRoute>
                    } />
                    <Route path="machines" element={<Machines />} />
                    <Route path="tasks" element={<Tasks />} />
                    {/* Outsource page - Only accessible by admin and planning */}
                    <Route path="outsource" element={
                        <ProtectedRoute allowedRoles={['admin', 'planning']}>
                            <Outsource />
                        </ProtectedRoute>
                    } />
                    <Route path="admin/approvals" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <UserApprovals />
                        </ProtectedRoute>
                    } />
                </Route>

                <Route path="/unauthorized" element={
                    <div className="flex items-center justify-center h-screen">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
                            <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
                        </div>
                    </div>
                } />
            </Routes>
        </AuthProvider>
    );
}

export default App;

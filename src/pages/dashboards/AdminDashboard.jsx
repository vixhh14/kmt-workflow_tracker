import React, { useState, useEffect } from 'react';
import { getAnalytics, getTasks, getMachines, getUsers } from '../../api/services';
import { CheckSquare, Clock, TrendingUp, Monitor, Users as UsersIcon, Calendar } from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-600 mb-1">{title}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${color}`}>
                <Icon className="text-white" size={24} />
            </div>
        </div>
    </div>
);

const COLORS = {
    pending: '#f59e0b',
    in_progress: '#3b82f6',
    completed: '#10b981',
    on_hold: '#ef4444',
    high: '#ef4444',
    medium: '#eab308',
    low: '#22c55e'
};

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchData();
    }, [selectedMonth, selectedYear]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [analyticsRes, usersRes, tasksRes, machinesRes] = await Promise.all([
                getAnalytics(),
                getUsers(),
                getTasks(selectedMonth, selectedYear),
                getMachines()
            ]);
            setAnalytics(analyticsRes.data);
            setUsers(usersRes.data);
            setTasks(tasksRes.data);
            setMachines(machinesRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get priority color based on task priority
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#ef4444'; // Red
            case 'medium': return '#eab308'; // Yellow
            case 'low': return '#22c55e'; // Green
            default: return '#6b7280'; // Gray
        }
    };

    // Tasks by Priority - X-axis: task names, color-coded by priority
    const getPriorityTaskData = () => {
        return tasks.slice(0, 10).map(task => ({
            name: task.title.length > 15 ? task.title.substring(0, 15) + '...' : task.title,
            value: 1,
            priority: task.priority,
            fill: getPriorityColor(task.priority)
        }));
    };

    // Project by Status - X-axis: project name, Y-axis: completion percentage
    const getProjectCompletionData = () => {
        // Group tasks by project
        const projectGroups = tasks.reduce((acc, task) => {
            const project = task.project || 'No Project';
            if (!acc[project]) {
                acc[project] = {
                    total: 0,
                    completed: 0
                };
            }
            acc[project].total++;
            if (task.status === 'completed') {
                acc[project].completed++;
            }
            return acc;
        }, {});

        // Calculate completion percentage for each project
        return Object.entries(projectGroups).map(([project, stats]) => ({
            name: project.length > 20 ? project.substring(0, 20) + '...' : project,
            completion: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
            total: stats.total,
            completed: stats.completed
        }));
    };

    const getStatusData = () => {
        const statuses = ['pending', 'in_progress', 'completed', 'on_hold'];
        return statuses.map(status => ({
            name: status.replace('_', ' ').toUpperCase(),
            value: tasks.filter(t => t.status === status).length,
            color: COLORS[status]
        }));
    };

    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' }
    ];

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600">System overview and analytics</p>
                </div>
                <div className="flex items-center space-x-3">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        {months.map(month => (
                            <option key={month.value} value={month.value}>{month.label}</option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        {[2024, 2025, 2026].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Active Projects"
                    value={analytics?.active_projects_count || 0}
                    icon={CheckSquare}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Present Today"
                    value={analytics?.attendance?.present_count || 0}
                    icon={UsersIcon}
                    color="bg-green-500"
                />
                <StatCard
                    title="On Leave / Absent"
                    value={analytics?.attendance?.absent_count || 0}
                    icon={UsersIcon}
                    color="bg-red-500"
                />
            </div>

            {/* Attendance Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4 text-green-700">Present Users</h3>
                    <div className="max-h-60 overflow-y-auto">
                        <ul className="divide-y divide-gray-100">
                            {analytics?.attendance?.present_list?.length > 0 ? (
                                analytics.attendance.present_list.map((u, idx) => (
                                    <li key={idx} className="py-2 flex justify-between items-center">
                                        <span className="font-medium text-gray-800">{u.full_name || u.username}</span>
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full capitalize">{u.role}</span>
                                    </li>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">No users present yet.</p>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4 text-red-700">Absent / On Leave</h3>
                    <div className="max-h-60 overflow-y-auto">
                        <ul className="divide-y divide-gray-100">
                            {analytics?.attendance?.absent_list?.length > 0 ? (
                                analytics.attendance.absent_list.map((u, idx) => (
                                    <li key={idx} className="py-2 flex justify-between items-center">
                                        <span className="font-medium text-gray-800">{u.full_name || u.username}</span>
                                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full capitalize">{u.role}</span>
                                    </li>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">Everyone is present!</p>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Project by Status - Completion Percentage */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Project Completion Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getProjectCompletionData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                interval={0}
                            />
                            <YAxis
                                label={{ value: 'Completion %', angle: -90, position: 'insideLeft' }}
                                domain={[0, 100]}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-white p-3 border border-gray-200 rounded shadow">
                                                <p className="font-semibold">{data.name}</p>
                                                <p className="text-sm text-gray-600">Completion: {data.completion}%</p>
                                                <p className="text-sm text-gray-600">Completed: {data.completed}/{data.total}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="completion" fill="#3b82f6" name="Completion %" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Tasks by Status */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Tasks by Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={getStatusData()}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {getStatusData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tasks by Priority - Color-coded by priority */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Tasks by Priority</h3>
                    <div className="mb-3 flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                            <span>High Priority</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                            <span>Medium Priority</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                            <span>Low Priority</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={getPriorityTaskData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                interval={0}
                            />
                            <YAxis />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-white p-2 border border-gray-200 rounded shadow">
                                                <p className="font-semibold text-sm">{data.name}</p>
                                                <p className="text-xs capitalize">Priority: {data.priority}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="value" name="Task">
                                {getPriorityTaskData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Tasks</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {tasks.slice(0, 5).map((task) => (
                                <tr key={task.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {task.title}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                task.status === 'on_hold' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {users.find(u => u.user_id === task.assigned_to)?.username || 'Unassigned'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

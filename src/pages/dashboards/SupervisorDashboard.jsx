import React, { useState, useEffect } from 'react';
import { getTasks, getUsers, updateTask, getAnalytics } from '../../api/services';
import { Users, CheckSquare, TrendingUp, AlertTriangle, Briefcase, UserPlus, Monitor } from 'lucide-react';
import {
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
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

const SupervisorDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tasksRes, usersRes, analyticsRes] = await Promise.all([
                getTasks(),
                getUsers(),
                getAnalytics()
            ]);
            setTasks(tasksRes.data);
            setUsers(usersRes.data.filter(u => u.role === 'operator'));
            setAnalytics(analyticsRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Operator-wise status (tasks per operator with status breakdown)
    const getOperatorStatus = () => {
        return users.map(user => {
            const userTasks = tasks.filter(t => t.assigned_to === user.user_id);
            const completed = userTasks.filter(t => t.status === 'completed').length;
            const inProgress = userTasks.filter(t => t.status === 'in_progress').length;
            const pending = userTasks.filter(t => t.status === 'pending').length;
            const onHold = userTasks.filter(t => t.status === 'on_hold').length;

            return {
                name: user.username,
                completed,
                inProgress,
                pending,
                onHold,
                total: userTasks.length
            };
        }).sort((a, b) => b.total - a.total);
    };

    // Priority task status - Tasks with color-coded priorities
    const getPriorityTaskStatus = () => {
        // Get all tasks and group by task name with priority
        const taskPriorities = tasks.slice(0, 10).map(task => ({
            name: task.title.length > 20 ? task.title.substring(0, 20) + '...' : task.title,
            priority: task.priority,
            value: 1 // Each task is 1 unit
        }));

        return taskPriorities;
    };

    // Get color based on priority
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#ef4444'; // Red
            case 'medium': return '#eab308'; // Yellow
            case 'low': return '#22c55e'; // Green
            default: return '#6b7280'; // Gray
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Supervisor Dashboard</h1>
                <p className="text-gray-600">Team oversight and task management</p>
            </div>

            {/* Stats Cards - Matching Admin Dashboard */}
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
                    icon={Users}
                    color="bg-green-500"
                />
                <StatCard
                    title="On Leave / Absent"
                    value={analytics?.attendance?.absent_count || 0}
                    icon={Users}
                    color="bg-red-500"
                />
            </div>

            {/* Quick Assign - Pending Tasks */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <UserPlus className="mr-2" size={20} />
                    Quick Assign - Pending Tasks
                </h3>
                <div className="space-y-3">
                    {tasks.filter(t => t.status === 'pending' || !t.assigned_to).slice(0, 5).map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">{task.title}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                    {task.project && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                            {task.project}
                                        </span>
                                    )}
                                    <span className={`text-xs px-2 py-0.5 rounded ${task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                        {task.priority}
                                    </span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <select
                                    onChange={async (e) => {
                                        if (e.target.value) {
                                            try {
                                                await updateTask(task.id, { assigned_to: e.target.value, status: 'pending' });
                                                fetchData();
                                            } catch (error) {
                                                console.error('Failed to assign task:', error);
                                                alert('Failed to assign task');
                                            }
                                        }
                                    }}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Assign to...</option>
                                    {users.map(user => (
                                        <option key={user.user_id} value={user.user_id}>
                                            {user.username}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                    {tasks.filter(t => t.status === 'pending' || !t.assigned_to).length === 0 && (
                        <p className="text-gray-500 text-sm">No pending tasks to assign</p>
                    )}
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Operator-wise Status */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Operator-wise Task Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getOperatorStatus()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="completed" fill="#10b981" name="Completed" />
                            <Bar dataKey="inProgress" fill="#3b82f6" name="In Progress" />
                            <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                            <Bar dataKey="onHold" fill="#ef4444" name="On Hold" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Priority Task Status */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Priority Task Status</h3>
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
                        <BarChart data={getPriorityTaskStatus()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" name="Task">
                                {getPriorityTaskStatus().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getPriorityColor(entry.priority)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Team Overview and Recent Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Users className="mr-2" size={20} />
                        Team Members
                    </h3>
                    <div className="space-y-3">
                        {users.map((user) => {
                            const userTasks = tasks.filter(t => t.assigned_to === user.user_id);
                            const userCompleted = userTasks.filter(t => t.status === 'completed').length;
                            const userInProgress = userTasks.filter(t => t.status === 'in_progress').length;
                            const userPending = userTasks.filter(t => t.status === 'pending').length;
                            return (
                                <div key={user.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{user.username}</p>
                                        <p className="text-sm text-gray-500">{user.full_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-900">{userTasks.length} tasks</p>
                                        <div className="flex space-x-2 text-xs mt-1">
                                            <span className="text-green-600">{userCompleted} done</span>
                                            <span className="text-blue-600">{userInProgress} active</span>
                                            <span className="text-yellow-600">{userPending} pending</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {users.length === 0 && (
                            <p className="text-gray-500 text-sm">No operators found</p>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Tasks</h3>
                    <div className="space-y-3">
                        {tasks.slice(0, 5).map((task) => (
                            <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-medium text-gray-900">{task.title}</p>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                            task.status === 'on_hold' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {task.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span>{users.find(u => u.user_id === task.assigned_to)?.username || 'Unassigned'}</span>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                        {task.priority}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {tasks.length === 0 && (
                            <p className="text-gray-500 text-sm">No recent tasks</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupervisorDashboard;

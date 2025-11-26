import React, { useState, useEffect } from 'react';
import { getTasks, startTask, holdTask, resumeTask, completeTask, denyTask } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { CheckSquare, Clock, AlertCircle, Play, Pause, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import {
    LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const OperatorDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Modal states
    const [showHoldModal, setShowHoldModal] = useState(false);
    const [showDenyModal, setShowDenyModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [holdReason, setHoldReason] = useState('');
    const [denyReason, setDenyReason] = useState('');

    const holdReasons = [
        'Waiting for materials',
        'Machine breakdown',
        'Shift change',
        'Waiting for supervisor approval',
        'Other'
    ];

    const denyReasons = [
        'Machine not available',
        'Missing materials',
        'Unclear instructions',
        'Safety concerns',
        'Insufficient time',
        'Other'
    ];

    useEffect(() => {
        fetchTasks();
        // Refresh tasks every 30 seconds
        const interval = setInterval(fetchTasks, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await getTasks();
            // Filter tasks assigned to this operator
            const myTasks = response.data.filter(task => task.assigned_to === user?.user_id);
            setTasks(myTasks);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartTask = async (taskId) => {
        try {
            await startTask(taskId);
            fetchTasks();
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to start task');
        }
    };

    const handleHoldTask = async () => {
        if (!holdReason) {
            alert('Please select a reason');
            return;
        }
        try {
            await holdTask(selectedTask.id, holdReason);
            setShowHoldModal(false);
            setHoldReason('');
            setSelectedTask(null);
            fetchTasks();
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to hold task');
        }
    };

    const handleResumeTask = async (taskId) => {
        try {
            await resumeTask(taskId);
            fetchTasks();
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to resume task');
        }
    };

    const handleCompleteTask = async (taskId) => {
        console.log('Attempting to complete task:', taskId);
        // if (window.confirm('Are you sure you want to mark this task as completed?')) {
        try {
            console.log('Calling API...');
            await completeTask(taskId);
            console.log('API call successful');
            alert('Task Completed Successfully!');
            fetchTasks();
        } catch (error) {
            console.error('Complete task error:', error);
            alert(error.response?.data?.detail || 'Failed to complete task');
        }
        // }
    };

    const handleDenyTask = async () => {
        if (!denyReason) {
            alert('Please select a reason');
            return;
        }
        try {
            await denyTask(selectedTask.id, denyReason);
            setShowDenyModal(false);
            setDenyReason('');
            setSelectedTask(null);
            fetchTasks();
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to deny task');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'on_hold': return 'bg-orange-100 text-orange-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'denied': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '0m';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const getTimeSince = (timestamp) => {
        if (!timestamp) return '';
        const now = new Date();
        const start = new Date(timestamp);
        const diffMs = now - start;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 60) return `${diffMins} mins ago`;
        const diffHours = Math.floor(diffMins / 60);
        return `${diffHours}h ${diffMins % 60}m ago`;
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const onHoldTasks = tasks.filter(t => t.status === 'on_hold');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Operator Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.full_name || user?.username}!</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Pending</p>
                            <p className="text-3xl font-bold text-yellow-600">{pendingTasks.length}</p>
                        </div>
                        <Clock className="text-yellow-500" size={32} />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">In Progress</p>
                            <p className="text-3xl font-bold text-blue-600">{inProgressTasks.length}</p>
                        </div>
                        <AlertCircle className="text-blue-500" size={32} />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">On Hold</p>
                            <p className="text-3xl font-bold text-orange-600">{onHoldTasks.length}</p>
                        </div>
                        <Pause className="text-orange-500" size={32} />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Completed</p>
                            <p className="text-3xl font-bold text-green-600">{completedTasks.length}</p>
                        </div>
                        <CheckSquare className="text-green-500" size={32} />
                    </div>
                </div>
            </div>

            {/* Personal Performance Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">My Task Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={[
                                    { name: 'Completed', value: completedTasks.length, color: '#10b981' },
                                    { name: 'In Progress', value: inProgressTasks.length, color: '#3b82f6' },
                                    { name: 'Pending', value: pendingTasks.length, color: '#f59e0b' },
                                    { name: 'On Hold', value: onHoldTasks.length, color: '#ef4444' }
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                                outerRadius={80}
                                dataKey="value"
                            >
                                {[completedTasks, inProgressTasks, pendingTasks, onHoldTasks].map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={[
                                        '#10b981', '#3b82f6', '#f59e0b', '#ef4444'
                                    ][index]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span className="text-gray-700">Completion Rate</span>
                            <span className="text-2xl font-bold text-green-600">
                                {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <span className="text-gray-700">Total Assigned</span>
                            <span className="text-2xl font-bold text-blue-600">{tasks.length}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                            <span className="text-gray-700">Active Tasks</span>
                            <span className="text-2xl font-bold text-yellow-600">
                                {pendingTasks.length + inProgressTasks.length}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* My Tasks */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold">My Assigned Tasks</h3>
                </div>
                <div className="divide-y">
                    {tasks.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No tasks assigned to you yet.
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <div key={task.id} className="p-6 hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{task.title}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                        <div className="flex items-center space-x-3 mt-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                                                {task.priority} priority
                                            </span>
                                            {task.started_at && task.status === 'in_progress' && (
                                                <span className="text-xs text-gray-600">
                                                    Started {getTimeSince(task.started_at)}
                                                </span>
                                            )}
                                            {task.total_duration_seconds > 0 && (
                                                <span className="text-xs text-gray-600">
                                                    Duration: {formatDuration(task.total_duration_seconds)}
                                                </span>
                                            )}
                                        </div>
                                        {task.hold_reason && (
                                            <p className="text-xs text-orange-600 mt-2">Hold reason: {task.hold_reason}</p>
                                        )}
                                    </div>
                                    <div className="flex space-x-2 ml-4">
                                        {task.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleStartTask(task.id)}
                                                    className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                                >
                                                    <Play size={16} />
                                                    <span>Start</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedTask(task);
                                                        setShowDenyModal(true);
                                                    }}
                                                    className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                                >
                                                    <XCircle size={16} />
                                                    <span>Deny</span>
                                                </button>
                                            </>
                                        )}
                                        {task.status === 'in_progress' && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setSelectedTask(task);
                                                        setShowHoldModal(true);
                                                    }}
                                                    className="flex items-center space-x-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                                                >
                                                    <Pause size={16} />
                                                    <span>Hold</span>
                                                </button>
                                                <button
                                                    onClick={() => handleCompleteTask(task.id)}
                                                    className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                                >
                                                    <CheckCircle size={16} />
                                                    <span>Complete</span>
                                                </button>
                                            </>
                                        )}
                                        {task.status === 'on_hold' && (
                                            <button
                                                onClick={() => handleResumeTask(task.id)}
                                                className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                            >
                                                <RotateCcw size={16} />
                                                <span>Resume</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Hold Modal */}
            {showHoldModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Hold Task</h3>
                        <p className="text-sm text-gray-600 mb-4">Please select a reason for holding this task:</p>
                        <select
                            value={holdReason}
                            onChange={(e) => setHoldReason(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                        >
                            <option value="">Select a reason...</option>
                            {holdReasons.map(reason => (
                                <option key={reason} value={reason}>{reason}</option>
                            ))}
                        </select>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleHoldTask}
                                className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                            >
                                Hold Task
                            </button>
                            <button
                                onClick={() => {
                                    setShowHoldModal(false);
                                    setHoldReason('');
                                    setSelectedTask(null);
                                }}
                                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Deny Modal */}
            {showDenyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Deny Task</h3>
                        <p className="text-sm text-gray-600 mb-4">Please select a reason for denying this task:</p>
                        <select
                            value={denyReason}
                            onChange={(e) => setDenyReason(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                        >
                            <option value="">Select a reason...</option>
                            {denyReasons.map(reason => (
                                <option key={reason} value={reason}>{reason}</option>
                            ))}
                        </select>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleDenyTask}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                            >
                                Deny Task
                            </button>
                            <button
                                onClick={() => {
                                    setShowDenyModal(false);
                                    setDenyReason('');
                                    setSelectedTask(null);
                                }}
                                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OperatorDashboard;

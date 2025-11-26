import React, { useState, useEffect } from 'react';
import { getAnalytics, getTasks, getMachines } from '../api/services';
import { CheckSquare, Clock, TrendingUp, Monitor } from 'lucide-react';

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

const Dashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [analyticsRes, machinesRes] = await Promise.all([
                getAnalytics(),
                getMachines()
            ]);
            setAnalytics(analyticsRes.data);
            setMachines(machinesRes.data);
            setError(null);
        } catch (err) {
            setError('Failed to load analytics data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Get machine name from ID
    const getMachineName = (machineId) => {
        const machine = machines.find(m => m.id === machineId);
        return machine ? machine.name : machineId;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Overview of your workflow tracker</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Tasks"
                    value={analytics?.total_tasks || 0}
                    icon={CheckSquare}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Completed"
                    value={analytics?.completed_tasks || 0}
                    icon={TrendingUp}
                    color="bg-green-500"
                />
                <StatCard
                    title="Pending"
                    value={analytics?.pending_tasks || 0}
                    icon={Clock}
                    color="bg-yellow-500"
                />
                <StatCard
                    title="Active Machines"
                    value={analytics?.active_machines || 0}
                    icon={Monitor}
                    color="bg-purple-500"
                />
            </div>

            {/* Tasks by Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Tasks by Status</h3>
                    <div className="space-y-3">
                        {analytics?.tasks_by_status && Object.entries(analytics.tasks_by_status).map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between">
                                <span className="text-gray-700 capitalize">{status}</span>
                                <span className="font-semibold text-gray-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Tasks by Priority</h3>
                    <div className="space-y-3">
                        {analytics?.tasks_by_priority && Object.entries(analytics.tasks_by_priority).map(([priority, count]) => (
                            <div key={priority} className="flex items-center justify-between">
                                <span className="text-gray-700 capitalize">{priority}</span>
                                <span className="font-semibold text-gray-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Machine Usage - Now shows machine names instead of IDs */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Machine Usage</h3>
                <div className="space-y-3">
                    {analytics?.machine_usage && Object.entries(analytics.machine_usage).map(([machineId, count]) => (
                        <div key={machineId} className="flex items-center justify-between">
                            <span className="text-gray-700">{getMachineName(machineId)}</span>
                            <span className="font-semibold text-gray-900">{count} tasks</span>
                        </div>
                    ))}
                    {(!analytics?.machine_usage || Object.keys(analytics.machine_usage).length === 0) && (
                        <p className="text-gray-500 text-sm">No machine usage data available</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

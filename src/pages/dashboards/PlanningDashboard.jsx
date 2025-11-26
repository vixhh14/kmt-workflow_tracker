import React, { useState, useEffect } from 'react';
import { getTasks, getOutsource, getMachines, getPlanningTasks } from '../../api/services';
import { Plus, Calendar, Package, ArrowRight, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const PlanningDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [outsource, setOutsource] = useState([]);
    const [machines, setMachines] = useState([]);
    const [planningTasks, setPlanningTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tasksRes, outsourceRes, machinesRes, planningRes] = await Promise.all([
                getTasks(),
                getOutsource(),
                getMachines(),
                getPlanningTasks()
            ]);
            setTasks(tasksRes.data);
            setOutsource(outsourceRes.data);
            setMachines(machinesRes.data);
            setPlanningTasks(planningRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    const activeMachines = machines.filter(m => m.status === 'active').length;
    const upcomingTasks = tasks.filter(t => t.status === 'pending').length;
    const completedPlanning = planningTasks.filter(p => p.status === 'completed').length;
    const pendingPlanning = planningTasks.filter(p => p.status === 'pending').length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Planning Dashboard</h1>
                    <p className="text-gray-600">Resource planning and task management</p>
                </div>
                <button
                    onClick={() => navigate('/tasks')}
                    className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                    <span>Manage Tasks</span>
                    <ArrowRight size={18} />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Tasks</p>
                            <p className="text-3xl font-bold text-gray-900">{tasks.length}</p>
                        </div>
                        <Calendar className="text-blue-500" size={32} />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Upcoming</p>
                            <p className="text-3xl font-bold text-yellow-600">{upcomingTasks}</p>
                        </div>
                        <Calendar className="text-yellow-500" size={32} />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Active Machines</p>
                            <p className="text-3xl font-bold text-green-600">{activeMachines}</p>
                        </div>
                        <Briefcase className="text-indigo-500" size={28} />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Pending Plans</p>
                            <p className="text-2xl font-bold text-yellow-600">{pendingPlanning}</p>
                        </div>
                        <Calendar className="text-yellow-500" size={28} />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Completed Plans</p>
                            <p className="text-2xl font-bold text-green-600">{completedPlanning}</p>
                        </div>
                        <Calendar className="text-green-500" size={28} />
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => navigate('/tasks')}
                        className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={20} />
                        <span>Create New Task</span>
                    </button>
                    <button
                        onClick={() => navigate('/outsource')}
                        className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-6 py-4 rounded-lg hover:bg-purple-700 transition"
                    >
                        <Plus size={20} />
                        <span>Add Outsource Item</span>
                    </button>
                    <button
                        onClick={() => navigate('/machines')}
                        className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition"
                    >
                        <Plus size={20} />
                        <span>Add Machine</span>
                    </button>
                </div>
            </div>

            {/* Resource Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Machine Availability</h3>
                    <div className="space-y-3">
                        {machines.slice(0, 5).map((machine) => (
                            <div key={machine.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{machine.name}</p>
                                    <p className="text-sm text-gray-500">{machine.type}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${machine.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {machine.status}
                                </span>
                            </div>
                        ))}
                        {machines.length === 0 && (
                            <p className="text-gray-500 text-sm">No machines found</p>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Planning Tasks</h3>
                    <div className="space-y-3">
                        {planningTasks.slice(0, 5).map((plan) => (
                            <div key={plan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{plan.project_name}</p>
                                    <p className="text-sm text-gray-500">Sequence: {plan.task_sequence}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${plan.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    plan.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {plan.status}
                                </span>
                            </div>
                        ))}
                        {planningTasks.length === 0 && (
                            <p className="text-gray-500 text-sm">No planning tasks yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanningDashboard;

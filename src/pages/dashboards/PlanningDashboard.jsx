import React, { useState, useEffect } from 'react';
import { getTasks, getOutsource, getMachines, getPlanningTasks, getPlanningOverview } from '../../api/services';
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
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tasksRes, outsourceRes, machinesRes, planningRes, overviewRes] = await Promise.all([
                getTasks(),
                getOutsource(),
                getMachines(),
                getPlanningTasks(),
                getPlanningOverview()
            ]);
            setTasks(tasksRes.data);
            setOutsource(outsourceRes.data);
            setMachines(machinesRes.data);
            setPlanningTasks(planningRes.data);
            setOverview(overviewRes.data);
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

            {/* Running Projects and Operator Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Running Projects */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4 text-blue-800">Running Projects Overview</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {overview?.projects?.length > 0 ? (
                            overview.projects.map((project, idx) => (
                                <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-gray-900">{project.name}</h4>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {project.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                                        <div
                                            className={`h-2.5 rounded-full ${project.progress === 100 ? 'bg-green-600' : 'bg-blue-600'
                                                }`}
                                            style={{ width: `${project.progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Progress: {project.progress}%</span>
                                        <span>{project.completed_tasks} / {project.total_tasks} Tasks</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">No active projects found.</p>
                        )}
                    </div>
                </div>

                {/* Operator Status */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4 text-purple-800">Operator Working Status</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {overview?.operators?.length > 0 ? (
                            overview.operators.map((op) => (
                                <div key={op.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${op.status === 'working' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                                            }`}></div>
                                        <div>
                                            <p className="font-medium text-gray-900">{op.name}</p>
                                            {op.status === 'working' ? (
                                                <p className="text-xs text-green-600 font-medium">
                                                    Working on: {op.current_task}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-gray-500">Idle</p>
                                            )}
                                        </div>
                                    </div>
                                    {op.machine && (
                                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded border border-indigo-100">
                                            {op.machine}
                                        </span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">No operators found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanningDashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Factory, ChevronDown, ChevronRight } from 'lucide-react';

const SignupSkills = () => {
    const navigate = useNavigate();
    const [signupData, setSignupData] = useState(null);
    const [categories, setCategories] = useState([]);
    const [machines, setMachines] = useState([]);
    const [selectedMachines, setSelectedMachines] = useState({});
    const [expandedCategories, setExpandedCategories] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Get signup data from session storage
        const data = sessionStorage.getItem('signupData');
        if (!data) {
            navigate('/signup');
            return;
        }
        setSignupData(JSON.parse(data));
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [categoriesRes, machinesRes] = await Promise.all([
                api.get('/api/machine-categories'),
                api.get('/machines')
            ]);

            setCategories(categoriesRes.data);
            setMachines(machinesRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            alert('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleCategory = (categoryName) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryName]: !prev[categoryName]
        }));
    };

    const handleMachineToggle = (machineId) => {
        setSelectedMachines(prev => {
            const newSelected = { ...prev };
            if (newSelected[machineId]) {
                delete newSelected[machineId];
            } else {
                newSelected[machineId] = 'intermediate';
            }
            return newSelected;
        });
    };

    const handleSkillLevelChange = (machineId, level) => {
        setSelectedMachines(prev => ({
            ...prev,
            [machineId]: level
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (Object.keys(selectedMachines).length === 0) {
            alert('Please select at least one machine you can operate');
            return;
        }

        setSubmitting(true);

        try {
            // Create user account (without unit_id - admin will assign during approval)
            const userData = {
                ...signupData,
                role: 'operator',
                approval_status: 'pending'
            };

            const userResponse = await api.post('/auth/signup', userData);
            const userId = userResponse.data.user_id;

            // Add machine skills
            const machineSkills = Object.entries(selectedMachines).map(([machineId, skillLevel]) => ({
                machine_id: machineId,
                skill_level: skillLevel
            }));

            await api.post(`/api/user-skills/${userId}/machines`, {
                machines: machineSkills
            });

            // Create approval record
            await api.post('/api/approvals', {
                user_id: userId,
                status: 'pending'
            });

            // Clear session storage
            sessionStorage.removeItem('signupData');

            // Show success message and redirect
            alert('Registration successful! Your account is pending admin approval. The admin will assign you to a unit based on your machine skills.');
            navigate('/login');

        } catch (error) {
            console.error('Failed to create account:', error);
            alert(error.response?.data?.detail || 'Failed to create account. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Group all machines by category (no unit filtering)
    const machinesByCategory = categories.reduce((acc, category) => {
        const categoryMachines = machines.filter(m => m.category_id === category.id);
        if (categoryMachines.length > 0) {
            acc[category.name] = categoryMachines;
        }
        return acc;
    }, {});

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <Factory className="text-blue-600" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Machine Skills</h1>
                    <p className="text-gray-600 mt-2">Step 2 of 2: Select machines you can operate</p>
                    <p className="text-sm text-gray-500 mt-1">Admin will assign you to a unit based on your skills</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Machine Selection */}
                    <div>
                        <label className="block text-lg font-semibold text-gray-900 mb-3">
                            Select Machines You Can Operate *
                            <span className="text-sm font-normal text-gray-600 ml-2">
                                ({Object.keys(selectedMachines).length} selected)
                            </span>
                        </label>

                        <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto">
                            {Object.entries(machinesByCategory).map(([categoryName, categoryMachines]) => (
                                <div key={categoryName} className="border-b border-gray-200 last:border-b-0">
                                    <button
                                        type="button"
                                        onClick={() => toggleCategory(categoryName)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
                                    >
                                        <div className="flex items-center space-x-2">
                                            {expandedCategories[categoryName] ? (
                                                <ChevronDown size={20} />
                                            ) : (
                                                <ChevronRight size={20} />
                                            )}
                                            <span className="font-semibold text-gray-900">{categoryName}</span>
                                            <span className="text-sm text-gray-500">
                                                ({categoryMachines.length} machines)
                                            </span>
                                        </div>
                                    </button>

                                    {expandedCategories[categoryName] && (
                                        <div className="px-4 pb-4 space-y-2">
                                            {categoryMachines.map(machine => (
                                                <div key={machine.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!selectedMachines[machine.id]}
                                                            onChange={() => handleMachineToggle(machine.id)}
                                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <div>
                                                            <span className="text-gray-900">{machine.name}</span>
                                                            <span className="text-xs text-gray-500 ml-2">
                                                                (Unit {machine.unit_id || 'N/A'})
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {selectedMachines[machine.id] && (
                                                        <select
                                                            value={selectedMachines[machine.id]}
                                                            onChange={(e) => handleSkillLevelChange(machine.id, e.target.value)}
                                                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <option value="beginner">Beginner</option>
                                                            <option value="intermediate">Intermediate</option>
                                                            <option value="expert">Expert</option>
                                                        </select>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate('/signup')}
                            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                        >
                            ← Back
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || Object.keys(selectedMachines).length === 0}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Submitting...' : 'Submit for Approval'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignupSkills;

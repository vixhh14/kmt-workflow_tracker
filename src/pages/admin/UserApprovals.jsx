import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCheck, UserX, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';

const UserApprovals = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [units, setUnits] = useState([]);
    const [machines, setMachines] = useState([]);
    const [userMachines, setUserMachines] = useState({});
    const [selectedUnits, setSelectedUnits] = useState({});
    const [expandedUsers, setExpandedUsers] = useState({});
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [approvalsRes, unitsRes, machinesRes] = await Promise.all([
                axios.get('http://localhost:8000/api/approvals/pending'),
                axios.get('http://localhost:8000/api/units'),
                axios.get('http://localhost:8000/machines')
            ]);

            setPendingUsers(approvalsRes.data);
            setUnits(unitsRes.data);
            setMachines(machinesRes.data);

            // Fetch machine skills for each user
            const machinePromises = approvalsRes.data.map(approval =>
                axios.get(`http://localhost:8000/api/user-skills/${approval.user_id}/machines`)
            );
            const machineResults = await Promise.all(machinePromises);

            const machinesMap = {};
            const suggestedUnits = {};

            approvalsRes.data.forEach((approval, index) => {
                const userMachineSkills = machineResults[index].data;
                machinesMap[approval.user_id] = userMachineSkills;

                // Suggest unit based on user's machine skills
                const suggestedUnit = suggestUnitForUser(userMachineSkills, machinesRes.data);
                suggestedUnits[approval.user_id] = suggestedUnit;
            });

            setUserMachines(machinesMap);
            setSelectedUnits(suggestedUnits);

        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Suggest unit based on which machines the user selected
    const suggestUnitForUser = (userMachineSkills, allMachines) => {
        if (!userMachineSkills || userMachineSkills.length === 0) return null;

        // Count machines per unit
        const unitCounts = {};
        userMachineSkills.forEach(um => {
            const machine = allMachines.find(m => m.id === um.machine_id);
            if (machine && machine.unit_id) {
                unitCounts[machine.unit_id] = (unitCounts[machine.unit_id] || 0) + 1;
            }
        });

        // Return unit with most machines
        let maxCount = 0;
        let suggestedUnit = null;
        Object.entries(unitCounts).forEach(([unitId, count]) => {
            if (count > maxCount) {
                maxCount = count;
                suggestedUnit = parseInt(unitId);
            }
        });

        return suggestedUnit;
    };

    const toggleUser = (userId) => {
        setExpandedUsers(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
    };

    const handleUnitChange = (userId, unitId) => {
        setSelectedUnits(prev => ({
            ...prev,
            [userId]: parseInt(unitId)
        }));
    };

    const handleApprove = async (userId) => {
        const selectedUnit = selectedUnits[userId];

        if (!selectedUnit) {
            alert('Please select a unit for this user before approving');
            return;
        }

        if (!window.confirm(`Approve this user and assign to Unit ${selectedUnit}?`)) return;

        try {
            // First, update user's unit_id
            await axios.put(`http://localhost:8000/users/${userId}`, {
                unit_id: selectedUnit
            });

            // Then approve the user
            await axios.post(`http://localhost:8000/api/approvals/${userId}/approve`, {
                notes: notes[userId] || ''
            });

            alert('User approved and assigned to unit successfully!');
            fetchData();
        } catch (error) {
            console.error('Failed to approve user:', error);
            alert('Failed to approve user: ' + (error.response?.data?.detail || error.message));
        }
    };

    const handleReject = async (userId) => {
        const reason = notes[userId] || prompt('Please provide a reason for rejection:');
        if (!reason) return;

        try {
            await axios.post(`http://localhost:8000/api/approvals/${userId}/reject`, {
                notes: reason
            });
            alert('User rejected');
            fetchData();
        } catch (error) {
            console.error('Failed to reject user:', error);
            alert('Failed to reject user');
        }
    };

    const getMachineName = (machineId) => {
        const machine = machines.find(m => m.id === machineId);
        return machine ? machine.name : 'Unknown Machine';
    };

    const getMachineUnit = (machineId) => {
        const machine = machines.find(m => m.id === machineId);
        return machine?.unit_id || 'N/A';
    };

    const getSkillBadgeColor = (level) => {
        switch (level) {
            case 'expert': return 'bg-green-100 text-green-800';
            case 'intermediate': return 'bg-blue-100 text-blue-800';
            case 'beginner': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">User Approvals</h1>
                <p className="text-gray-600">Review and approve new user registrations. Assign units based on machine skills.</p>
            </div>

            {pendingUsers.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <UserCheck className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500">No pending approvals</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingUsers.map((approval) => (
                        <div key={approval.user_id} className="bg-white rounded-lg shadow">
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <button
                                            onClick={() => toggleUser(approval.user_id)}
                                            className="flex items-center space-x-2 text-left w-full"
                                        >
                                            {expandedUsers[approval.user_id] ? (
                                                <ChevronDown size={20} />
                                            ) : (
                                                <ChevronRight size={20} />
                                            )}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {approval.user.full_name}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    @{approval.user.username} • {approval.user.email}
                                                </p>
                                            </div>
                                        </button>

                                        {expandedUsers[approval.user_id] && (
                                            <div className="mt-4 pl-7 space-y-4">
                                                {/* User Details */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">Date of Birth</p>
                                                        <p className="text-sm text-gray-900">{approval.user.date_of_birth || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">Contact Number</p>
                                                        <p className="text-sm text-gray-900">{approval.user.contact_number || 'N/A'}</p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <p className="text-sm font-medium text-gray-700">Address</p>
                                                        <p className="text-sm text-gray-900">{approval.user.address || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">Applied On</p>
                                                        <p className="text-sm text-gray-900">
                                                            {new Date(approval.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Machine Skills */}
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 mb-2">
                                                        Machine Skills ({userMachines[approval.user_id]?.length || 0} machines)
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {userMachines[approval.user_id]?.map((um) => (
                                                            <div key={um.id} className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                                                                <span className="text-sm text-gray-900">
                                                                    {getMachineName(um.machine_id)}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    (Unit {getMachineUnit(um.machine_id)})
                                                                </span>
                                                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getSkillBadgeColor(um.skill_level)}`}>
                                                                    {um.skill_level}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Unit Assignment */}
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                    <div className="flex items-start space-x-2">
                                                        <AlertCircle className="text-blue-600 mt-0.5" size={20} />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-blue-900 mb-2">
                                                                Assign Unit (Required)
                                                            </p>
                                                            <select
                                                                value={selectedUnits[approval.user_id] || ''}
                                                                onChange={(e) => handleUnitChange(approval.user_id, e.target.value)}
                                                                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                                                            >
                                                                <option value="">Select a unit...</option>
                                                                {units.map(unit => (
                                                                    <option key={unit.id} value={unit.id}>
                                                                        {unit.name} - {unit.description}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {selectedUnits[approval.user_id] && (
                                                                <p className="text-xs text-blue-700 mt-1">
                                                                    ✓ Suggested based on machine skills
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Notes */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Notes (optional)
                                                    </label>
                                                    <textarea
                                                        value={notes[approval.user_id] || ''}
                                                        onChange={(e) => setNotes({ ...notes, [approval.user_id]: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        rows="2"
                                                        placeholder="Add notes about this approval..."
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-2 ml-4">
                                        <button
                                            onClick={() => handleApprove(approval.user_id)}
                                            className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                                        >
                                            <UserCheck size={18} />
                                            <span>Approve</span>
                                        </button>
                                        <button
                                            onClick={() => handleReject(approval.user_id)}
                                            className="flex items-center space-x-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                                        >
                                            <UserX size={18} />
                                            <span>Reject</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserApprovals;

// frontend/src/components/MessManagement.jsx
import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Save, XCircle, Loader2 } from 'lucide-react';
import axios from '../api/axiosConfig';

export default function MessManagement() {
  const [staffList, setStaffList] = useState([]);
  const [newStaff, setNewStaff] = useState({ name: '', mobile: '', email: '' });
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await axios.get('/mess-staff');
      setStaffList(res.data);
    } catch (err) {
      console.error('Failed to fetch mess staff:', err);
      setError('Could not load staff list. Please refresh the page.');
    }
  };

  const handleNewStaffChange = (e) => {
    setNewStaff({ ...newStaff, [e.target.name]: e.target.value });
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.post('/mess-staff/', newStaff);
      setStaffList([...staffList, res.data]);
      setSuccess(`Staff member "${newStaff.name}" added successfully!`);
      setNewStaff({ name: '', mobile: '', email: '' });
    } catch (err) {
      console.error('Failed to add mess staff:', err);
      const errorMessage =
        err.response?.data?.error || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (staff) => {
    setEditingId(staff._id);
    setEditedData({ name: staff.name, mobile: staff.mobile, email: staff.email });
  };

  const handleEditChange = (e) => {
    setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  const handleSave = async (id) => {
    try {
      const res = await axios.put(`/mess-staff/${id}`, editedData);
      setStaffList(staffList.map(staff => (staff._id === id ? res.data : staff)));
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update mess staff:', err);
      setError('Failed to save changes. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await axios.delete(`/mess-staff/${id}`);
        setStaffList(staffList.filter(staff => staff._id !== id));
      } catch (err) {
        console.error('Failed to delete mess staff:', err);
        setError('Failed to delete staff member.');
      }
    }
  };

  return (
    <div className="bg-gray-100 p-4 sm:p-6 rounded-lg">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center sm:text-left">
        🍽️ Mess Management
      </h1>

      {/* Add New Staff Section */}
      <div className="bg-white p-4 sm:p-6 rounded-lg mb-6 shadow">
        <h2 className="text-lg sm:text-xl font-bold mb-3 text-center sm:text-left">
          Add New Mess Staff
        </h2>

        {/* Feedback Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Error: </strong>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Success! </strong>
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleAddMember}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          <input
            type="text"
            name="name"
            value={newStaff.name}
            onChange={handleNewStaffChange}
            placeholder="Name"
            className="border px-3 py-2 rounded w-full focus:ring focus:ring-blue-200"
            required
          />
          <input
            type="text"
            name="mobile"
            value={newStaff.mobile}
            onChange={handleNewStaffChange}
            placeholder="Mobile No"
            className="border px-3 py-2 rounded w-full focus:ring focus:ring-blue-200"
            required
          />
          <input
            type="email"
            name="email"
            value={newStaff.email}
            onChange={handleNewStaffChange}
            placeholder="Email"
            className="border px-3 py-2 rounded w-full focus:ring focus:ring-blue-200"
            required
          />
          <button
            type="submit"
            className="flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
            {isLoading ? 'Adding...' : 'Add Member'}
          </button>
        </form>
      </div>

      {/* Staff List */}
      <div className="bg-white px-4 py-2 sm:px-6 sm:py-3 rounded-full text-black font-bold text-lg border border-black mb-4 text-center sm:text-left">
        Authorised Mess Staff
      </div>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="w-full text-center border border-black bg-white text-sm sm:text-base">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-black py-2 px-3">Name</th>
              <th className="border border-black py-2 px-3">Mobile</th>
              <th className="border border-black py-2 px-3">Email</th>
              <th className="border border-black py-2 px-3 hidden sm:table-cell">
                Date of Authorization
              </th>
              <th className="border border-black py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff) => (
              <tr
                key={staff._id}
                className="hover:bg-gray-50 transition-colors"
              >
                {editingId === staff._id ? (
                  <>
                    <td className="border border-black p-2">
                      <input
                        type="text"
                        name="name"
                        value={editedData.name}
                        onChange={handleEditChange}
                        className="border px-2 py-1 w-full rounded"
                      />
                    </td>
                    <td className="border border-black p-2">
                      <input
                        type="text"
                        name="mobile"
                        value={editedData.mobile}
                        onChange={handleEditChange}
                        className="border px-2 py-1 w-full rounded"
                      />
                    </td>
                    <td className="border border-black p-2">
                      <input
                        type="email"
                        name="email"
                        value={editedData.email}
                        onChange={handleEditChange}
                        className="border px-2 py-1 w-full rounded"
                      />
                    </td>
                    <td className="border border-black p-2 hidden sm:table-cell font-mono text-xs sm:text-sm">
                      {new Date(staff.dateOfAuthorization).toLocaleDateString()}
                    </td>
                    <td className="border border-black p-2">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleSave(staff._id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Save size={18} />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="border border-black font-semibold py-2 px-3">
                      {staff.name}
                    </td>
                    <td className="border border-black py-2 px-3">
                      {staff.mobile}
                    </td>
                    <td className="border border-black py-2 px-3">
                      {staff.email}
                    </td>
                    <td className="border border-black py-2 px-3 hidden sm:table-cell font-mono text-xs sm:text-sm">
                      {new Date(staff.dateOfAuthorization).toLocaleDateString()}
                    </td>
                    <td className="border border-black py-2 px-3">
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => handleEditClick(staff)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(staff._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

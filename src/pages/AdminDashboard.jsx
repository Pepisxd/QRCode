import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isInside, setIsInside] = useState(false);

  useEffect(() => {
    // Obtener la lista de usuarios
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/admin/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Obtener el token desde el almacenamiento local
          },
        });
        setUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleChangeStatus = async (userId) => {
    try {
      await axios.post(
        '/api/admin/change-user-status',
        { userId, isInside },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      alert('User status updated');
    } catch (error) {
      console.error("Error changing user status:", error);
      alert('Failed to update user status');
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <select onChange={(e) => setSelectedUser(e.target.value)} value={selectedUser}>
        <option value="">Select User</option>
        {users.map((user) => (
          <option key={user._id} value={user._id}>
            {user.username}
          </option>
        ))}
      </select>
      <div>
        <label>
          <input
            type="checkbox"
            checked={isInside}
            onChange={(e) => setIsInside(e.target.checked)}
          />
          Is Inside
        </label>
      </div>
      <button onClick={() => handleChangeStatus(selectedUser)}>Change Status</button>
    </div>
  );
};

export default AdminDashboard;

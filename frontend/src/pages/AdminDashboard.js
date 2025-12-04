import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AdminDashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, usersRes] = await Promise.all([
        api.get('/api/admin/analytics'),
        api.get('/api/admin/users')
      ]);
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const userRoleData = analytics ? [
    { name: 'Drivers', value: analytics.users.drivers },
    { name: 'Managers', value: analytics.users.managers }
  ] : [];

  const peakHoursData = analytics?.peakHours?.map(hour => ({
    name: `${hour._id}:00`,
    bookings: hour.count
  })) || [];

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1>Admin Dashboard</h1>

        {analytics && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <p className="stat-value">{analytics.users.total}</p>
              </div>
              <div className="stat-card">
                <h3>Parking Lots</h3>
                <p className="stat-value">{analytics.parkingLots.total}</p>
              </div>
              <div className="stat-card">
                <h3>Total Slots</h3>
                <p className="stat-value">{analytics.slots.total}</p>
              </div>
              <div className="stat-card">
                <h3>Total Bookings</h3>
                <p className="stat-value">{analytics.bookings.total}</p>
              </div>
              <div className="stat-card">
                <h3>Revenue</h3>
                <p className="stat-value">₹{analytics.revenue.toFixed(2)}</p>
              </div>
              <div className="stat-card">
                <h3>Utilization Rate</h3>
                <p className="stat-value">{analytics.slots.utilizationRate}%</p>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h2>User Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userRoleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userRoleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h2>Peak Hours</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={peakHoursData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        <div className="users-section">
          <h2>Users</h2>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.isVerified ? '✓' : '✗'}</td>
                    <td>
                      <button className="btn btn-small btn-secondary">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


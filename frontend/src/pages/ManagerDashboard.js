import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLot, setNewLot] = useState({
    name: '',
    address: { street: '', city: '', state: '', zipCode: '', country: '' },
    location: { latitude: '', longitude: '' },
    totalSlots: 0,
    pricing: { hourly: 0, daily: 0, monthly: 0 },
    operatingHours: { open: '08:00', close: '20:00' }
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      const res = await api.get('/api/parking-lots');
      // Filter lots managed by current user
      setLots(res.data);
    } catch (error) {
      console.error('Error fetching lots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLot = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/parking-lots', newLot);
      toast.success('Parking lot created successfully');
      setShowCreateModal(false);
      fetchLots();
      setNewLot({
        name: '',
        address: { street: '', city: '', state: '', zipCode: '', country: '' },
        location: { latitude: '', longitude: '' },
        totalSlots: 0,
        pricing: { hourly: 0, daily: 0, monthly: 0 },
        operatingHours: { open: '08:00', close: '20:00' }
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create parking lot');
    }
  };

  const chartData = lots.map(lot => ({
    name: lot.name,
    total: lot.totalSlots,
    available: lot.availableSlots,
    occupied: lot.totalSlots - lot.availableSlots
  }));

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="manager-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Manager Dashboard</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            + Create Parking Lot
          </button>
        </div>

        {lots.length > 0 && (
          <div className="chart-section">
            <h2>Parking Lot Occupancy</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="available" fill="#28a745" name="Available" />
                <Bar dataKey="occupied" fill="#dc3545" name="Occupied" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="lots-section">
          <h2>My Parking Lots</h2>
          {lots.length === 0 ? (
            <div className="no-lots">
              <p>You haven't created any parking lots yet.</p>
            </div>
          ) : (
            <div className="lots-grid">
              {lots.map((lot) => (
                <div key={lot._id} className="lot-card">
                  <h3>{lot.name}</h3>
                  <p className="lot-address">{lot.address?.city}, {lot.address?.state}</p>
                  <div className="lot-stats">
                    <span>Available: {lot.availableSlots}</span>
                    <span>Total: {lot.totalSlots}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/parking-lot/${lot._id}`)}
                    className="btn btn-primary"
                  >
                    Manage
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Create Parking Lot</h2>
              <form onSubmit={handleCreateLot}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={newLot.name}
                    onChange={(e) => setNewLot({ ...newLot, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Street Address</label>
                  <input
                    type="text"
                    value={newLot.address.street}
                    onChange={(e) => setNewLot({
                      ...newLot,
                      address: { ...newLot.address, street: e.target.value }
                    })}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={newLot.address.city}
                      onChange={(e) => setNewLot({
                        ...newLot,
                        address: { ...newLot.address, city: e.target.value }
                      })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      value={newLot.address.state}
                      onChange={(e) => setNewLot({
                        ...newLot,
                        address: { ...newLot.address, state: e.target.value }
                      })}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={newLot.location.latitude}
                      onChange={(e) => setNewLot({
                        ...newLot,
                        location: { ...newLot.location, latitude: e.target.value }
                      })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={newLot.location.longitude}
                      onChange={(e) => setNewLot({
                        ...newLot,
                        location: { ...newLot.location, longitude: e.target.value }
                      })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Total Slots</label>
                  <input
                    type="number"
                    min="1"
                    value={newLot.totalSlots}
                    onChange={(e) => setNewLot({ ...newLot, totalSlots: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hourly Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newLot.pricing.hourly}
                    onChange={(e) => setNewLot({
                      ...newLot,
                      pricing: { ...newLot.pricing, hourly: parseFloat(e.target.value) }
                    })}
                    required
                  />
                </div>
                <div className="modal-buttons">
                  <button type="submit" className="btn btn-primary">Create</button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;


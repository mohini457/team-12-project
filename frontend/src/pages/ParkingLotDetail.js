import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import './ParkingLotDetail.css';

const ParkingLotDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [lot, setLot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingData, setBookingData] = useState({
    startTime: '',
    expectedEndTime: '',
    vehicleNumber: ''
  });
  const [updateData, setUpdateData] = useState({
    status: '',
    type: ''
  });
  const isManager = user && (user.role === 'manager' || user.role === 'admin');
  const isOwner = lot && user && (user.role === 'admin' || lot.manager?._id === user.id || lot.manager === user.id);

  useEffect(() => {
    fetchLotDetails();
    fetchSlots();
  }, [id]);

  const fetchLotDetails = async () => {
    try {
      const res = await api.get(`/api/parking-lots/${id}`);
      setLot(res.data);
    } catch (error) {
      console.error('Error fetching lot:', error);
      toast.error('Failed to load parking lot details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    try {
      const res = await api.get(`/api/slots?parkingLot=${id}`);
      setSlots(res.data);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleBookSlot = (slot) => {
    if (!user) {
      toast.info('Please login to book a slot');
      navigate('/login');
      return;
    }
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/bookings', {
        slot: selectedSlot._id,
        ...bookingData
      });
      toast.success('Slot booked successfully!');
      setShowBookingModal(false);
      fetchSlots();
      fetchLotDetails();
      navigate('/bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    }
  };

  const handleUpdateSlot = (slot) => {
    setSelectedSlot(slot);
    setUpdateData({
      status: slot.status,
      type: slot.type
    });
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/slots/${selectedSlot._id}/status`, {
        status: updateData.status
      });
      
      // Also update type if changed
      if (updateData.type !== selectedSlot.type) {
        await api.put(`/api/slots/${selectedSlot._id}`, {
          type: updateData.type
        });
      }
      
      toast.success('Slot updated successfully!');
      setShowUpdateModal(false);
      fetchSlots();
      fetchLotDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update slot');
    }
  };

  const getSlotStatusColor = (status) => {
    switch (status) {
      case 'available': return '#28a745';
      case 'occupied': return '#dc3545';
      case 'reserved': return '#ffc107';
      case 'maintenance': return '#6c757d';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!lot) {
    return <div className="error">Parking lot not found</div>;
  }

  return (
    <div className="parking-lot-detail">
      <div className="container">
        <div className="lot-header">
          <h1>{lot.name}</h1>
          <p className="address">
            {lot.address?.street}, {lot.address?.city}, {lot.address?.state}
          </p>
          <div className="lot-stats">
            <div className="stat">
              <span className="stat-label">Available Slots</span>
              <span className="stat-value">{lot.availableSlots}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total Slots</span>
              <span className="stat-value">{lot.totalSlots}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Price</span>
              <span className="stat-value">₹{lot.pricing?.hourly || 0}/hr</span>
            </div>
          </div>
        </div>

        <div className="slots-section">
          <div className="slots-header">
            <h2>{isManager && isOwner ? 'Manage Slots' : 'Available Slots'}</h2>
            {isManager && isOwner && (
              <p className="manager-note">Click on any slot to update its status manually</p>
            )}
          </div>
          <div className="slots-grid">
            {slots.map((slot) => (
              <div
                key={slot._id}
                className="slot-card"
                style={{ borderColor: getSlotStatusColor(slot.status) }}
              >
                <div className="slot-header">
                  <h3>{slot.slotNumber}</h3>
                  <span
                    className="slot-status"
                    style={{ backgroundColor: getSlotStatusColor(slot.status) }}
                  >
                    {slot.status}
                  </span>
                </div>
                <p className="slot-type">Type: {slot.type}</p>
                {isManager && isOwner ? (
                  <button
                    onClick={() => handleUpdateSlot(slot)}
                    className="btn btn-secondary btn-small"
                  >
                    Update Status
                  </button>
                ) : (
                  slot.status === 'available' && (
                    <button
                      onClick={() => handleBookSlot(slot)}
                      className="btn btn-primary btn-small"
                    >
                      Book Now
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        </div>

        {showBookingModal && (
          <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Book Slot {selectedSlot?.slotNumber}</h2>
              <form onSubmit={handleBookingSubmit}>
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={bookingData.startTime}
                    onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Expected End Time</label>
                  <input
                    type="datetime-local"
                    name="expectedEndTime"
                    value={bookingData.expectedEndTime}
                    onChange={(e) => setBookingData({ ...bookingData, expectedEndTime: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Vehicle Number</label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={bookingData.vehicleNumber}
                    onChange={(e) => setBookingData({ ...bookingData, vehicleNumber: e.target.value })}
                    placeholder={user?.vehicleNumber || 'Enter vehicle number'}
                  />
                </div>
                <div className="modal-buttons">
                  <button type="submit" className="btn btn-primary">
                    Confirm Booking
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowBookingModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showUpdateModal && (
          <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Update Slot {selectedSlot?.slotNumber}</h2>
              <form onSubmit={handleUpdateSubmit}>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={updateData.status}
                    onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                    required
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Slot Type</label>
                  <select
                    name="type"
                    value={updateData.type}
                    onChange={(e) => setUpdateData({ ...updateData, type: e.target.value })}
                    required
                  >
                    <option value="openAir">Open Air</option>
                    <option value="covered">Covered</option>
                    <option value="evCharging">EV Charging</option>
                    <option value="handicapAccessible">Handicap Accessible</option>
                  </select>
                </div>
                <div className="modal-buttons">
                  <button type="submit" className="btn btn-primary">
                    Update Slot
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowUpdateModal(false)}
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

export default ParkingLotDetail;


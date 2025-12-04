import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import './Bookings.css';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/api/bookings');
      setBookings(res.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (bookingId) => {
    try {
      await api.put(`/api/bookings/${bookingId}/complete`);
      toast.success('Booking completed');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete booking');
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    try {
      await api.put(`/api/bookings/${bookingId}/cancel`);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reserved': return '#ffc107';
      case 'active': return '#28a745';
      case 'completed': return '#6c757d';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="bookings">
      <div className="container">
        <h1>My Bookings</h1>
        {bookings.length === 0 ? (
          <div className="no-bookings">
            <p>You have no bookings yet.</p>
            <a href="/search" className="btn btn-primary">Search Parking</a>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <h3>{booking.parkingLot?.name}</h3>
                  <span
                    className="booking-status"
                    style={{ backgroundColor: getStatusColor(booking.status) }}
                  >
                    {booking.status}
                  </span>
                </div>
                <div className="booking-details">
                  <p><strong>Slot:</strong> {booking.slot?.slotNumber}</p>
                  <p><strong>Type:</strong> {booking.slot?.type}</p>
                  <p><strong>Start Time:</strong> {format(new Date(booking.startTime), 'PPpp')}</p>
                  {booking.expectedEndTime && (
                    <p><strong>Expected End:</strong> {format(new Date(booking.expectedEndTime), 'PPpp')}</p>
                  )}
                  {booking.endTime && (
                    <p><strong>End Time:</strong> {format(new Date(booking.endTime), 'PPpp')}</p>
                  )}
                  <p><strong>Amount:</strong> ₹{booking.amount}</p>
                  {booking.vehicleNumber && (
                    <p><strong>Vehicle:</strong> {booking.vehicleNumber}</p>
                  )}
                </div>
                <div className="booking-actions">
                  {booking.status === 'reserved' && (
                    <>
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className="btn btn-danger"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {booking.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleComplete(booking._id)}
                        className="btn btn-success"
                      >
                        Complete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;


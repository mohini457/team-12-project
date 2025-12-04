import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ParkingMap from '../components/ParkingMap';
import './SearchParking.css';

const SearchParking = () => {
  const [searchParams, setSearchParams] = useState({
    city: '',
    latitude: '',
    longitude: '',
    radius: 5,
    type: '',
    minSlots: 1
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setSearchParams(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key]) {
          params.append(key, searchParams[key]);
        }
      });

      const res = await api.get(`/api/search?${params.toString()}`);
      setResults(res.data.results || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-parking">
      <div className="container">
        <h1>Search Parking</h1>
        
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={searchParams.city}
                onChange={handleChange}
                placeholder="Enter city name"
              />
            </div>
            <div className="form-group">
              <label>Radius (km)</label>
              <input
                type="number"
                name="radius"
                value={searchParams.radius}
                onChange={handleChange}
                min="1"
                max="50"
              />
            </div>
            <div className="form-group">
              <label>Slot Type</label>
              <select name="type" value={searchParams.type} onChange={handleChange}>
                <option value="">All Types</option>
                <option value="covered">Covered</option>
                <option value="openAir">Open Air</option>
                <option value="evCharging">EV Charging</option>
                <option value="handicapAccessible">Handicap Accessible</option>
              </select>
            </div>
            <div className="form-group">
              <label>Min Available Slots</label>
              <input
                type="number"
                name="minSlots"
                value={searchParams.minSlots}
                onChange={handleChange}
                min="1"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {userLocation && (
          <div className="map-container">
            <ParkingMap
              center={userLocation}
              parkingLots={results}
              userLocation={userLocation}
            />
          </div>
        )}

        <div className="results">
          <h2>Results ({results.length})</h2>
          {results.length === 0 && !loading && (
            <p>No parking lots found. Try adjusting your search criteria.</p>
          )}
          <div className="results-grid">
            {results.map((lot) => (
              <div key={lot._id} className="result-card">
                <h3>{lot.name}</h3>
                <p className="address">
                  {lot.address?.street}, {lot.address?.city}
                </p>
                {lot.distance && (
                  <p className="distance">📍 {lot.distance} km away</p>
                )}
                <div className="lot-info">
                  <span className="badge">Available: {lot.availableSlots}</span>
                  <span className="badge">Total: {lot.totalSlots}</span>
                  <span className="badge">₹{lot.pricing?.hourly || 0}/hr</span>
                </div>
                <button
                  onClick={() => navigate(`/parking-lot/${lot._id}`)}
                  className="btn btn-primary"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchParking;


const express = require('express');
const ParkingLot = require('../models/ParkingLot');
const Slot = require('../models/Slot');

const router = express.Router();

// Helper function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

// @route   GET /api/search
// @desc    Search parking lots with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      latitude, 
      longitude, 
      radius = 10, // km
      type, 
      minSlots = 1,
      maxPrice,
      city,
      sortBy = 'distance' // distance, price, availability
    } = req.query;

    let query = { isActive: true };

    // City filter
    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }

    // Get all parking lots matching basic criteria
    let lots = await ParkingLot.find(query)
      .populate('manager', 'name email');

    // Filter by location if coordinates provided
    if (latitude && longitude) {
      lots = lots.map(lot => {
        const distance = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          lot.location.latitude,
          lot.location.longitude
        );
        return { ...lot.toObject(), distance };
      }).filter(lot => lot.distance <= parseFloat(radius));
    }

    // Get slot availability for each lot
    const lotsWithSlots = await Promise.all(
      lots.map(async (lot) => {
        const slotQuery = { parkingLot: lot._id, status: 'available' };
        
        if (type) {
          slotQuery.type = type;
        }

        const availableSlots = await Slot.countDocuments(slotQuery);
        const totalSlots = await Slot.countDocuments({ parkingLot: lot._id });

        return {
          ...lot,
          availableSlots,
          totalSlots,
          occupancyRate: totalSlots > 0 ? ((totalSlots - availableSlots) / totalSlots * 100).toFixed(2) : 0
        };
      })
    );

    // Filter by minimum available slots
    let filteredLots = lotsWithSlots.filter(lot => lot.availableSlots >= parseInt(minSlots));

    // Filter by max price
    if (maxPrice) {
      filteredLots = filteredLots.filter(lot => 
        lot.pricing.hourly <= parseFloat(maxPrice)
      );
    }

    // Sort results
    if (sortBy === 'distance' && latitude && longitude) {
      filteredLots.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'price') {
      filteredLots.sort((a, b) => a.pricing.hourly - b.pricing.hourly);
    } else if (sortBy === 'availability') {
      filteredLots.sort((a, b) => b.availableSlots - a.availableSlots);
    }

    res.json({
      count: filteredLots.length,
      results: filteredLots
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/search/nearby
// @desc    Get nearby parking lots
// @access  Public
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const lots = await ParkingLot.find({ isActive: true });

    const nearbyLots = await Promise.all(
      lots.map(async (lot) => {
        const distance = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          lot.location.latitude,
          lot.location.longitude
        );

        if (distance <= parseFloat(radius)) {
          const availableSlots = await Slot.countDocuments({
            parkingLot: lot._id,
            status: 'available'
          });

          return {
            ...lot.toObject(),
            distance: parseFloat(distance.toFixed(2)),
            availableSlots
          };
        }
        return null;
      })
    );

    const filtered = nearbyLots
      .filter(lot => lot !== null)
      .sort((a, b) => a.distance - b.distance);

    res.json({
      count: filtered.length,
      results: filtered
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


import React from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const ParkingMap = ({ center, parkingLots = [], userLocation }) => {
  const [selectedLot, setSelectedLot] = React.useState(null);

  if (!center) {
    return <div>Loading map...</div>;
  }

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={13}
      >
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            }}
            title="Your Location"
          />
        )}
        
        {parkingLots.map((lot) => (
          <Marker
            key={lot._id}
            position={{
              lat: lot.location.latitude,
              lng: lot.location.longitude
            }}
            onClick={() => setSelectedLot(lot)}
            icon={{
              url: lot.availableSlots > 0 
                ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            }}
          />
        ))}

        {selectedLot && (
          <InfoWindow
            position={{
              lat: selectedLot.location.latitude,
              lng: selectedLot.location.longitude
            }}
            onCloseClick={() => setSelectedLot(null)}
          >
            <div>
              <h3>{selectedLot.name}</h3>
              <p>Available: {selectedLot.availableSlots}</p>
              <p>Price: ₹{selectedLot.pricing?.hourly || 0}/hr</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default ParkingMap;


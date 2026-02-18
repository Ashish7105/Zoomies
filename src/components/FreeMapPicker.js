"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import "leaflet/dist/leaflet.css";

// Integrated Map Component
const MapComponent = ({ center, coordinates, onMapClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [uniqueId] = useState(() => `map-${Math.random().toString(36).substr(2, 9)}`);
  const initTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || isInitialized) return;

    if (!document.body.contains(mapRef.current)) {
      console.warn("Map container not in DOM, skipping initialization");
      return;
    }

    initTimeoutRef.current = setTimeout(() => {
      if (!mapRef.current || !document.body.contains(mapRef.current)) {
        console.warn("Map container not available, skipping");
        return;
      }

      import("leaflet").then((L) => {
        try {
          if (mapInstanceRef.current) {
            return;
          }

          if (!mapRef.current) {
            console.warn("Map container became unavailable");
            return;
          }

          // Fix default markers
          try {
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
              iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
              iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
              shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            });
          } catch (e) {
            // Icon fix failed, but continue
          }

          const mapContainer = mapRef.current;
          if (!mapContainer || mapContainer.innerHTML.includes("leaflet")) {
            return;
          }

          const mapInstance = L.map(mapContainer, {
            center: [center.lat, center.lng],
            zoom: 13,
            scrollWheelZoom: true,
            zoomControl: true,
          });

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(mapInstance);

          mapInstance.on("click", (e) => {
            if (e.latlng) {
              const { lat, lng } = e.latlng;
              onMapClick({ lat, lng });
            }
          });

          mapInstanceRef.current = mapInstance;
          setIsInitialized(true);
        } catch (error) {
          console.error("Error initializing map:", error);
          mapInstanceRef.current = null;
        }
      }).catch((error) => {
        console.error("Error importing Leaflet:", error);
      });
    }, 100);

    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, [isInitialized, center.lat, center.lng, onMapClick]);

  useEffect(() => {
    if (!mapInstanceRef.current || !isInitialized) return;

    try {
      if (mapInstanceRef.current && typeof mapInstanceRef.current.setView === "function") {
        mapInstanceRef.current.setView([center.lat, center.lng], 13);
      }
    } catch (error) {
      console.warn("Error updating map view:", error);
    }
  }, [center.lat, center.lng, isInitialized]);

  useEffect(() => {
    if (!mapInstanceRef.current || !isInitialized) return;
    if (!coordinates) return; // Add null check

    import("leaflet").then((L) => {
      try {
        if (markerRef.current) {
          try {
            mapInstanceRef.current.removeLayer(markerRef.current);
          } catch (e) {
            // Already removed
          }
          markerRef.current = null;
        }

        if (coordinates.lat && coordinates.lng && mapInstanceRef.current) {
          markerRef.current = L.marker([coordinates.lat, coordinates.lng]).addTo(mapInstanceRef.current);
        }
      } catch (error) {
        console.warn("Error updating marker:", error);
      }
    }).catch((error) => {
      console.error("Error importing Leaflet for marker:", error);
    });
  }, [coordinates?.lat, coordinates?.lng, isInitialized]);

  useEffect(() => {
    return () => {
      try {
        if (mapInstanceRef.current) {
          if (markerRef.current) {
            try {
              mapInstanceRef.current.removeLayer(markerRef.current);
            } catch (e) {
              // Already removed
            }
          }
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          markerRef.current = null;
        }
      } catch (error) {
        console.error("Error cleaning up map:", error);
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      id={uniqueId}
      style={{
        height: "100%",
        width: "100%",
        position: "relative",
        backgroundColor: "#f0f0f0",
      }}
    />
  );
};

// Free reverse geocoding using Nominatim (OpenStreetMap)
const reverseGeocode = async (lat, lng, onAddressFound) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&limit=1`
    );

    if (!response.ok) {
      console.warn(`Reverse geocoding HTTP error: ${response.status}`);
      return;
    }

    const data = await response.json();
    if (data && data.display_name) {
      onAddressFound(data.display_name);
    } else {
      console.warn("No address found for coordinates:", { lat, lng });
    }
  } catch (error) {
    console.warn("Reverse geocoding failed:", error instanceof Error ? error.message : String(error));
  }
};

// Free geocoding using Nominatim (OpenStreetMap)
const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(address)}&limit=1`
    );

    if (!response.ok) {
      console.warn(`Geocoding HTTP error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    if (data && data[0]) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    } else {
      console.warn("No results found for address:", address);
      return null;
    }
  } catch (error) {
    console.error("Geocoding failed:", error instanceof Error ? error.message : String(error));
    return null;
  }
};

const FreeMapPicker = ({ coordinates, onCoordinatesChange, address = "", onAddressChange }) => {
  const [searchAddress, setSearchAddress] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const searchLocation = useCallback(async () => {
    if (!searchAddress.trim()) {
      alert("Please enter a location to search.");
      return;
    }

    setIsSearching(true);

    try {
      const result = await geocodeAddress(searchAddress);
      if (result) {
        onCoordinatesChange(result);
        if (onAddressChange) {
          reverseGeocode(result.lat, result.lng, onAddressChange);
        }
        setSearchAddress("");
      } else {
        alert("Location not found. Please try a different search term.");
      }
    } catch (error) {
      console.error("Search failed:", error);
      alert("Search failed. Please check your internet connection and try again.");
    } finally {
      setIsSearching(false);
    }
  }, [searchAddress, onCoordinatesChange, onAddressChange]);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onCoordinatesChange({ lat: latitude, lng: longitude });
        reverseGeocode(latitude, longitude, onAddressChange);
      },
      (error) => {
        let errorMessage = "Unable to get your current location.";

        try {
          const errorCode = error?.code ?? -1;
          const errorMsg = error?.message ?? "";

          if (errorCode === 1) {
            errorMessage = "Permission denied: Please allow access to your location in browser settings.";
          } else if (errorCode === 2) {
            errorMessage = "Position unavailable: Your location data could not be retrieved. Make sure location services are enabled.";
          } else if (errorCode === 3) {
            errorMessage = "Request timed out: Please try again.";
          } else if (errorMsg) {
            errorMessage = `Location error: ${errorMsg}`;
          }
        } catch (e) {
          console.warn("Could not parse geolocation error:", e);
        }

        console.error("Geolocation error:", error);
        alert(errorMessage);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [onCoordinatesChange, onAddressChange]);

  const handleMapClick = useCallback(
    (coords) => {
      onCoordinatesChange(coords);
      if (onAddressChange) {
        reverseGeocode(coords.lat, coords.lng, onAddressChange);
      }
    },
    [onCoordinatesChange, onAddressChange]
  );

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  const mapCenter = coordinates && coordinates.lat && coordinates.lng ? coordinates : { lat: 28.6139, lng: 77.209 };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <input
          placeholder="Search address"
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              searchLocation();
            }
          }}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button
          onClick={searchLocation}
          disabled={isSearching}
          className="px-4 py-2 bg-orange-400 text-white rounded-lg font-medium hover:bg-orange-500 transition disabled:bg-gray-400"
        >
          {isSearching ? "..." : "Search"}
        </button>
      </div>

      {/* Map Container with "My Location" overlay button */}
      <div className="relative border border-gray-200 rounded-lg overflow-hidden" style={{ height: "280px" }}>
        <MapComponent center={mapCenter} coordinates={coordinates || mapCenter} onMapClick={handleMapClick} />
        
        {/* "My Location" button overlaid on map - top right */}
        <button
          onClick={getCurrentLocation}
          className="absolute top-3 right-3 bg-white text-gray-800 rounded-lg p-2 shadow-lg hover:bg-gray-50 transition border border-gray-200 z-10"
          title="Show your location"
        >
          📍
        </button>
      </div>

      {/* Coordinates Display */}
      <div className="text-sm space-y-2">
        <div className="text-gray-700">
          <label className="font-medium text-gray-800">Coordinates:</label>
          <p className="text-xs text-gray-600 mt-1">
            Lat: {coordinates?.lat?.toFixed(6) || "0.000000"}, Lng: {coordinates?.lng?.toFixed(6) || "0.000000"}
          </p>
        </div>
        {address && (
          <div className="text-gray-700">
            <label className="font-medium text-gray-800">Address:</label>
            <p className="text-xs text-gray-600 mt-1">{address}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreeMapPicker;

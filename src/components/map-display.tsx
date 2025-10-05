"use client";

import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import L, { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MapPin } from 'lucide-react';

// Custom icon for the map marker to fix a known issue with leaflet bundled with webpack
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapDisplayProps {
  location: [number, number];
}

export function MapDisplay({ location }: MapDisplayProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);

  useEffect(() => {
    // Initialize map only once
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: location,
        zoom: 13,
        scrollWheelZoom: false,
      });
      
      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
      ).addTo(map);

      const marker = L.marker(location, { icon: customIcon }).addTo(map);
      marker.bindPopup('Your event location.');

      mapRef.current = map;
      markerRef.current = marker;
    }

    // Function to run when the component unmounts
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    // Update map view and marker when location changes
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView(location, 13);
      markerRef.current.setLatLng(location);
    }
  }, [location]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
            <MapPin className="mr-2 h-5 w-5" /> Location Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full rounded-lg overflow-hidden z-0" ref={mapContainerRef} />
      </CardContent>
    </Card>
  );
}

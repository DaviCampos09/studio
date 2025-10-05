"use client";

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, type LatLngExpression } from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MapPin } from 'lucide-react';
import { useEffect } from 'react';

// Custom icon for the map marker to fix a known issue with react-leaflet
const customIcon = new Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Child component to handle map view changes
function ChangeView({ center, zoom }: { center: LatLngExpression, zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

interface MapDisplayProps {
  location: [number, number];
}

export function MapDisplay({ location }: MapDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
            <MapPin className="mr-2 h-5 w-5" /> Location Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full rounded-lg overflow-hidden z-0">
             <MapContainer 
                center={location} 
                zoom={13} 
                scrollWheelZoom={false} 
                style={{ height: '100%', width: '100%' }}
            >
                <ChangeView center={location} zoom={13} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={location} icon={customIcon}>
                    <Popup>
                    Your event location.
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}

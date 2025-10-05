"use client";

import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import L, { Map as LeafletMap, Marker as LeafletMarker, TileLayer } from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MapPin } from 'lucide-react';

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
  const layersRef = useRef<{ [key: string]: TileLayer | L.LayerGroup }>({});

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const streets = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
      );

      const satellite = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }
      );
      
      const clouds = L.tileLayer(
        'https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=1b3e7d5225d4efa2c229947ce8473543',
        {
          attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
          opacity: 0.7
        }
      );

      layersRef.current = {
        "Streets": streets,
        "Satellite": satellite,
        "Clouds": clouds
      };

      const map = L.map(mapContainerRef.current, {
        center: location,
        zoom: 13,
        scrollWheelZoom: false,
        layers: [streets] // Default layer
      });
      
      L.control.layers(layersRef.current).addTo(map);

      const marker = L.marker(location, { icon: customIcon }).addTo(map);
      marker.bindPopup('Your event location.');

      mapRef.current = map;
      markerRef.current = marker;
    }

    // Cleanup function to run when component unmounts
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  useEffect(() => {
    if (mapRef.current && markerRef.current && location) {
      const newLatLng = new L.LatLng(location[0], location[1]);
      mapRef.current.setView(newLatLng, 13);
      markerRef.current.setLatLng(newLatLng);
    }
  }, [location]); // Re-run when location changes

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
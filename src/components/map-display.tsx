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
      
      const sentinel = L.tileLayer(
          'https://services.sentinel-hub.com/ogc/wms/bd86bcc0-02d1-4474-9164-39a04a43452b?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=TRUE_COLOR&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}',
          {
              attribution: 'Sentinel-2 data from <a href="https://www.sentinel-hub.com/" target="_blank">Sentinel Hub</a>'
          }
      );

      const landsat = L.tileLayer(
          'https://landsat.arcgis.com/arcgis/rest/services/Landsat/LS_2016/ImageServer/tile/{z}/{y}/{x}',
          {
              attribution: 'Landsat 8 data from <a href="https://www.arcgis.com/" target="_blank">ArcGIS</a>'
          }
      );


      const map = L.map(mapContainerRef.current, {
        center: location,
        zoom: 13,
        scrollWheelZoom: false,
        layers: [streets] // Default layer
      });
      
      const baseMaps = {
        "Streets": streets,
        "Satellite": satellite,
        "Sentinel-2": sentinel,
        "Landsat 8": landsat
      };

      L.control.layers(baseMaps).addTo(map);

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

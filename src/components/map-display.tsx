"use client";

import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import L, { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';
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
      
      const wmsUrl = 'https://terrabrasilis.dpi.inpe.br/geoserver/wms';
      
      const inpeCbers4aMux = L.tileLayer.wms(wmsUrl, {
        layers: 'cbers4a-mux',
        format: 'image/png',
        transparent: true,
        attribution: 'INPE'
      });
      
      const inpeCbers4Mux = L.tileLayer.wms(wmsUrl, {
        layers: 'cbers4-mux',
        format: 'image/png',
        transparent: true,
        attribution: 'INPE'
      });
      
      const inpeCbers4Wfi = L.tileLayer.wms(wmsUrl, {
        layers: 'cbers4-wfi',
        format: 'image/png',
        transparent: true,
        attribution: 'INPE'
      });
      
      const inpeSentinel2 = L.tileLayer.wms(wmsUrl, {
        layers: 's2-l4-bands-rgb',
        format: 'image/png',
        transparent: true,
        attribution: 'INPE'
      });

      const map = L.map(mapContainerRef.current, {
        center: location,
        zoom: 13,
        scrollWheelZoom: false,
        layers: [streets]
      });
      
      const baseMaps = {
        "Streets": streets,
        "Satellite": satellite,
        "CBERS-4A MUX (INPE)": inpeCbers4aMux,
        "CBERS-4 MUX (INPE)": inpeCbers4Mux,
        "CBERS-4 WFI (INPE)": inpeCbers4Wfi,
        "Sentinel-2 (INPE)": inpeSentinel2,
      };

      L.control.layers(baseMaps).addTo(map);

      const marker = L.marker(location, { icon: customIcon }).addTo(map);
      marker.bindPopup('Your event location.');

      mapRef.current = map;
      markerRef.current = marker;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
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

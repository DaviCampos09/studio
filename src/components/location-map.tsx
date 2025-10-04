"use client";

import React, { useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface LocationMapProps {
  location: string;
}

const parseCoordinates = (location: string): { lat: number; lng: number } | null => {
  const parts = location.split(',').map(s => s.trim());
  if (parts.length === 2) {
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }
  return null;
};

export function LocationMap({ location }: LocationMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  const position = useMemo(() => parseCoordinates(location), [location]);

  if (!apiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Location Map</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center h-48">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Map feature is unavailable.</p>
          <p className="text-xs text-muted-foreground mt-2">
            Google Maps API key is not configured.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!position) {
     return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Location Map</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center h-48">
           <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
           <p className="text-muted-foreground">Could not display map.</p>
           <p className="text-xs text-muted-foreground mt-2">
            Please provide location as "latitude, longitude" to see it on the map.
           </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Location Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 w-full rounded-md overflow-hidden">
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={position}
              defaultZoom={10}
              mapId="outdoor-event-map"
              gestureHandling={'greedy'}
              disableDefaultUI={true}
            >
              <AdvancedMarker position={position} />
            </Map>
          </APIProvider>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, WMSTileLayer } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Layers } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import type { ConditionLikelihoodForecastOutput } from '@/ai/flows/condition-likelihood-forecast';

interface LocationMapProps {
  location: string;
  forecast: ConditionLikelihoodForecastOutput | null;
  displayName: string;
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

const nasaLayers = {
    none: { name: 'None', url: '' },
    clouds: { name: 'Clouds (GOES-East)', url: 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi', params: { layers: 'GOES-East_Full_Disk_Band_2_Red_Visible_1km' } },
    precipitation: { name: 'Precipitation (GPM)', url: 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi', params: { layers: 'GPM_3IMERGHHE_Precipitation' } },
};

export function LocationMap({ location, forecast, displayName }: LocationMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [activeLayer, setActiveLayer] = useState<keyof typeof nasaLayers>('none');
  const position = useMemo(() => parseCoordinates(location), [location]);
  
  useEffect(() => {
    setIsClient(true);
  }, []);


  if (!isClient) {
      return (
          <Card>
            <CardHeader>
                <CardTitle className="font-headline">Location Map</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-48 w-full rounded-md bg-muted animate-pulse" />
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
            Enter a location in the form to see it on the map.
           </p>
        </CardContent>
      </Card>
    );
  }
  
  const currentLayer = nasaLayers[activeLayer];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className='flex-1 overflow-hidden'>
            <CardTitle className="font-headline truncate" title={displayName}>{displayName}</CardTitle>
        </div>
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className='ml-4'>
                    <Layers className="mr-2 h-4 w-4" />
                    <span>Layers</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>NASA GIBS Layers</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={activeLayer} onValueChange={(value) => setActiveLayer(value as keyof typeof nasaLayers)}>
                    {Object.entries(nasaLayers).map(([key, layer]) => (
                         <DropdownMenuRadioItem key={key} value={key}>{layer.name}</DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="h-48 w-full rounded-md overflow-hidden">
          <MapContainer key={location} center={[position.lat, position.lng]} zoom={10} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {currentLayer.url && (
                <WMSTileLayer
                    url={currentLayer.url}
                    params={{
                        ...currentLayer.params,
                        transparent: true,
                        format: 'image/png',
                    }}
                />
            )}
            <Marker position={[position.lat, position.lng]}>
              {forecast?.currentWeather && (
                <Popup>
                  Temperature: {forecast.currentWeather.temperature}°C <br />
                  Humidity: {forecast.currentWeather.humidity}%
                </Popup>
              )}
            </Marker>
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}

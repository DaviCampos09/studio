"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, WMSTileLayer } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Layers } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import type { ConditionLikelihoodForecastOutput } from '@/ai/flows/condition-likelihood-forecast';
import { Skeleton } from './ui/skeleton';
import { LatLngExpression } from 'leaflet';


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

function MapWrapper({ center, children }: { center: LatLngExpression, children: React.ReactNode }) {
    return (
        <MapContainer center={center} zoom={10} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            {children}
        </MapContainer>
    );
}


export function LocationMap({ location, forecast, displayName }: LocationMapProps) {
  const [activeLayer, setActiveLayer] = useState<keyof typeof nasaLayers>('none');
  const position = useMemo(() => parseCoordinates(location), [location]);
  
  const currentLayer = nasaLayers[activeLayer];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className='flex-1 overflow-hidden'>
            <CardTitle className="font-headline truncate" title={displayName}>{displayName || 'Location Map'}</CardTitle>
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
          {position ? (
            <MapWrapper center={[position.lat, position.lng]}>
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
            </MapWrapper>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-48">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Could not display map.</p>
              <p className="text-xs text-muted-foreground mt-2">
                Enter a location in the form to see it on the map.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

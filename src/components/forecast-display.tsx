import type { ConditionLikelihoodForecastOutput } from "@/ai/flows/condition-likelihood-forecast";
import { LikelihoodScores } from "./likelihood-scores";
import { DetailedReport } from "./detailed-report";
import dynamic from 'next/dynamic';
import { Skeleton } from "./ui/skeleton";
import type { Map as LeafletMap } from 'leaflet';

const MapDisplay = dynamic(() => import('./map-display').then(mod => mod.MapDisplay), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full rounded-lg" />,
});

interface ForecastDisplayProps {
  forecast: ConditionLikelihoodForecastOutput | null;
  location: [number, number] | null;
  map: LeafletMap | null;
  setMap: (map: LeafletMap | null) => void;
}

export function ForecastDisplay({ forecast, location, map, setMap }: ForecastDisplayProps) {
  if (!forecast) {
    return null;
  }

  return (
    <div className="space-y-6">
      <LikelihoodScores likelihoods={forecast.conditionLikelihoods} />
      {location && <MapDisplay location={location} map={map} setMap={setMap} />}
      <DetailedReport report={forecast.detailedReport} />
    </div>
  );
}

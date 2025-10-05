import type { ConditionLikelihoodForecastOutput } from "@/ai/flows/condition-likelihood-forecast";
import { LikelihoodScores } from "./likelihood-scores";
import { DetailedReport } from "./detailed-report";
import dynamic from 'next/dynamic';
import { Skeleton } from "./ui/skeleton";

// Dynamically import MapDisplay only on the client side
const MapDisplay = dynamic(() => import('./map-display').then(mod => mod.MapDisplay), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />
});

interface ForecastDisplayProps {
  forecast: ConditionLikelihoodForecastOutput | null;
  location: [number, number] | null;
}

export function ForecastDisplay({ forecast, location }: ForecastDisplayProps) {

  const shouldShowContent = forecast && !isNaN(forecast?.currentWeather?.temperature);

  return (
    <div className="space-y-6" style={{ display: shouldShowContent ? 'block' : 'none' }}>
      {forecast && (
        <>
          <LikelihoodScores likelihoods={forecast.conditionLikelihoods} />
          {location && <MapDisplay location={location} />}
          <DetailedReport report={forecast.detailedReport} />
        </>
      )}
    </div>
  );
}

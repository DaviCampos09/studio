import type { ConditionLikelihoodForecastOutput } from "@/ai/flows/condition-likelihood-forecast";
import { LikelihoodScores } from "./likelihood-scores";
import { DetailedReport } from "./detailed-report";
import dynamic from 'next/dynamic';
import { Skeleton } from "./ui/skeleton";

const MapDisplay = dynamic(() => import('./map-display').then(mod => mod.MapDisplay), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full rounded-lg" />,
});

interface ForecastDisplayProps {
  forecast: ConditionLikelihoodForecastOutput | null;
  location: [number, number] | null;
}

export function ForecastDisplay({ forecast, location }: ForecastDisplayProps) {
  if (!forecast) {
    return null;
  }

  return (
    <div className="space-y-6">
      <LikelihoodScores likelihoods={forecast.conditionLikelihoods} />
      {location && <MapDisplay location={location} />}
      <DetailedReport report={forecast.detailedReport} />
    </div>
  );
}

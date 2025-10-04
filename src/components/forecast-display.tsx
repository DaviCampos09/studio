import type { ConditionLikelihoodForecastOutput } from "@/ai/flows/condition-likelihood-forecast";
import { LikelihoodScores } from "./likelihood-scores";
import { DetailedReport } from "./detailed-report";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const LocationMap = dynamic(() => import("./location-map").then(mod => mod.LocationMap), { 
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

interface ForecastDisplayProps {
  forecast: ConditionLikelihoodForecastOutput;
  location: string;
}

export function ForecastDisplay({ forecast, location }: ForecastDisplayProps) {
  return (
    <div className="space-y-6">
      <LikelihoodScores likelihoods={forecast.conditionLikelihoods} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DetailedReport report={forecast.detailedReport} />
        <LocationMap location={location} forecast={forecast} />
      </div>
    </div>
  );
}

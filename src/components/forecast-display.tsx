import type { ConditionLikelihoodForecastOutput } from "@/ai/flows/condition-likelihood-forecast";
import { LikelihoodScores } from "./likelihood-scores";
import { DetailedReport } from "./detailed-report";
import { LocationMap } from "./location-map";

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
        <LocationMap location={location} />
      </div>
    </div>
  );
}

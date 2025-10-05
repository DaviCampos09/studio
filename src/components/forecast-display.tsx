import type { ConditionLikelihoodForecastOutput } from "@/ai/flows/condition-likelihood-forecast";
import { LikelihoodScores } from "./likelihood-scores";

interface ForecastDisplayProps {
  forecast: ConditionLikelihoodForecastOutput | null;
  location: [number, number] | null;
}

export function ForecastDisplay({ forecast, location }: ForecastDisplayProps) {

  const shouldShowContent = forecast && !isNaN(forecast?.currentWeather?.temperature);

  return (
    <div className="space-y-4" style={{ display: shouldShowContent ? 'block' : 'none' }}>
      {forecast && (
        <LikelihoodScores 
          likelihoods={forecast.conditionLikelihoods} 
          report={forecast.detailedReport}
          location={location}
          forecast={forecast}
        />
      )}
    </div>
  );
}

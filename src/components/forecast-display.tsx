import type { ConditionLikelihoodForecastOutput } from "@/ai/flows/condition-likelihood-forecast";
import { LikelihoodScores } from "./likelihood-scores";
import { DetailedReport } from "./detailed-report";

interface ForecastDisplayProps {
  forecast: ConditionLikelihoodForecastOutput;
}

export function ForecastDisplay({ forecast }: ForecastDisplayProps) {
  return (
    <div className="space-y-6">
      <LikelihoodScores likelihoods={forecast.conditionLikelihoods} />
      <DetailedReport report={forecast.detailedReport} />
    </div>
  );
}

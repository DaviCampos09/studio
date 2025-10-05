import type { ConditionLikelihoodForecastOutput } from "@/ai/flows/condition-likelihood-forecast";
import { LikelihoodScores } from "./likelihood-scores";
import { DetailedReport } from "./detailed-report";
import { Skeleton } from "./ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ForecastDisplayProps {
  forecast: ConditionLikelihoodForecastOutput | null;
  location: [number, number] | null;
}

export function ForecastDisplay({ forecast, location }: ForecastDisplayProps) {

  const shouldShowContent = forecast && !isNaN(forecast?.currentWeather?.temperature);

  return (
    <div className="space-y-4" style={{ display: shouldShowContent ? 'block' : 'none' }}>
      {forecast && (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Resumo</TabsTrigger>
            <TabsTrigger value="report">Relatório</TabsTrigger>
          </TabsList>
          <TabsContent value="summary" className="mt-4">
            <LikelihoodScores likelihoods={forecast.conditionLikelihoods} location={location} />
          </TabsContent>
          <TabsContent value="report" className="mt-4">
            <DetailedReport report={forecast.detailedReport} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

import type { ConditionLikelihoodForecastOutput } from "@/ai/flows/condition-likelihood-forecast";
import { LikelihoodScores } from "./likelihood-scores";
import { DetailedReport } from "./detailed-report";
import dynamic from 'next/dynamic';
import { Skeleton } from "./ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, Map, FileText } from "lucide-react";

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
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary"><List className="mr-2 h-4 w-4" /> Resumo</TabsTrigger>
            <TabsTrigger value="map"><Map className="mr-2 h-4 w-4" /> Mapa</TabsTrigger>
            <TabsTrigger value="report"><FileText className="mr-2 h-4 w-4" /> Relatório</TabsTrigger>
          </TabsList>
          <TabsContent value="summary" className="mt-4">
            <LikelihoodScores likelihoods={forecast.conditionLikelihoods} />
          </TabsContent>
          <TabsContent value="map" className="mt-4">
            {location && <MapDisplay location={location} />}
          </TabsContent>
          <TabsContent value="report" className="mt-4">
            <DetailedReport report={forecast.detailedReport} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

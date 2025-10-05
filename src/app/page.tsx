
"use client";

import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getForecast } from "@/app/actions";
import { ForecasterForm } from "@/components/forecaster-form";
import { ForecastDisplay } from "@/components/forecast-display";
import type { ConditionLikelihoodForecastOutput } from "@/ai/flows/condition-likelihood-forecast";
import type { ForecasterSchema } from "@/lib/schemas";
import { Skeleton } from "@/components/ui/skeleton";
import { CloudDrizzle } from "lucide-react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [forecast, setForecast] = useState<ConditionLikelihoodForecastOutput | null>(null);
  const [locationCoords, setLocationCoords] = useState<[number, number] | null>(null);
  const { toast } = useToast();
  const forecastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (forecast && forecastRef.current) {
      forecastRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [forecast]);

  const handleFormSubmit = async (data: ForecasterSchema) => {
    setIsLoading(true);
    setForecast(null);
    setLocationCoords(null);

    const result = await getForecast(data);

    if (result.success && result.data) {
      setForecast(result.data);
      if (result.location) {
        const [lat, lon] = result.location.split(',').map(Number);
        setLocationCoords([lat, lon]);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }

    setIsLoading(false);
  };
  
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <div className="space-y-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-3 w-3/4" />
        <div className="space-y-3 pt-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );

  return (
    <main className="container mx-auto px-4 py-4 md:py-6">
      <header className="text-center mb-4">
        <h1 className="text-base font-bold font-headline tracking-tight">
          Outdoor Event Forecaster
        </h1>
        <p className="mt-1 max-w-lg mx-auto text-xs text-muted-foreground">
          Plan your perfect day out. Get an AI-powered weather forecast.
        </p>
      </header>
      
      <div className="grid grid-cols-1 gap-6">
        <div>
            <ForecasterForm onFormSubmit={handleFormSubmit} isLoading={isLoading} />
        </div>
        <div ref={forecastRef}>
          {isLoading && <LoadingSkeleton />}
          
          <div style={{ display: forecast && !isLoading ? 'block' : 'none' }}>
            <ForecastDisplay forecast={forecast} location={locationCoords} />
          </div>

          {!isLoading && !forecast && (
            <div className="flex flex-col items-center justify-center text-center h-full min-h-[250px] bg-card rounded-lg border border-dashed p-6">
              <CloudDrizzle className="h-8 w-8 text-muted-foreground mb-3" />
              <h3 className="text-base font-semibold font-headline">Your forecast awaits</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Fill out the form to see your personalized weather outlook.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

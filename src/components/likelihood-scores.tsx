"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sun, Snowflake, Wind, Droplets, Frown } from "lucide-react";
import type { ConditionLikelihoodForecastOutput } from "@/ai/flows/condition-likelihood-forecast";
import React from "react";
import dynamic from 'next/dynamic';
import { Skeleton } from "./ui/skeleton";
import { DetailedReport } from "./detailed-report";

// Dynamically import MapDisplay only on the client side
const MapDisplay = dynamic(() => import('./map-display').then(mod => mod.MapDisplay), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full min-h-[220px]" />
});

type Likelihoods = ConditionLikelihoodForecastOutput['conditionLikelihoods'];

interface LikelihoodScoresProps {
  likelihoods: Likelihoods;
  report: string;
  location: [number, number] | null;
}

const scoreConfig: { [key in keyof Likelihoods]: { label: string; icon: React.ElementType; color: string } } = {
  veryHot: { label: "Very Hot", icon: Sun, color: "bg-chart-1" },
  veryCold: { label: "Very Cold", icon: Snowflake, color: "bg-chart-3" },
  veryWindy: { label: "Very Windy", icon: Wind, color: "bg-chart-4" },
  veryHumid: { label: "Very Humid", icon: Droplets, color: "bg-chart-2" },
  uncomfortable: { label: "Uncomfortable", icon: Frown, color: "bg-chart-5" },
};

export function LikelihoodScores({ likelihoods, report, location }: LikelihoodScoresProps) {
    const sortedLikelihoods = (Object.keys(likelihoods) as Array<keyof Likelihoods>).sort((a, b) => likelihoods[b] - likelihoods[a]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Forecast Summary</CardTitle>
        <CardDescription>Based on historical data and forecast models.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4 md:col-span-1">
            {sortedLikelihoods.map((key) => {
              const config = scoreConfig[key];
              const value = likelihoods[key] * 100;
              if (!config) return null;

              return (
                <div key={key} className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <config.icon className="mr-2 h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{config.label}</span>
                    </div>
                    <span className="font-semibold">{value.toFixed(0)}%</span>
                  </div>
                  <Progress value={value} indicatorClassName={config.color} />
                </div>
              );
            })}
          </div>
          <div className="md:col-span-1">
            {location && <MapDisplay location={location} />}
          </div>
          <div className="md:col-span-1">
            <DetailedReport report={report} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

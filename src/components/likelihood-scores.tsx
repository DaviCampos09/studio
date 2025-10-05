"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sun, Snowflake, Wind, Droplets, Frown, Download } from "lucide-react";
import type { ConditionLikelihoodForecastOutput } from "@/ai/flows/condition-likelihood-forecast";
import React from "react";
import dynamic from 'next/dynamic';
import { Skeleton } from "./ui/skeleton";
import { DetailedReport } from "./detailed-report";
import { Button } from "./ui/button";

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
  forecast: ConditionLikelihoodForecastOutput | null;
}

const scoreConfig: { [key in keyof Likelihoods]: { label: string; icon: React.ElementType; color: string } } = {
  veryHot: { label: "Very Hot", icon: Sun, color: "bg-chart-1" },
  veryCold: { label: "Very Cold", icon: Snowflake, color: "bg-chart-3" },
  veryWindy: { label: "Very Windy", icon: Wind, color: "bg-chart-4" },
  veryHumid: { label: "Very Humid", icon: Droplets, color: "bg-chart-2" },
  uncomfortable: { label: "Uncomfortable", icon: Frown, color: "bg-chart-5" },
};

export function LikelihoodScores({ likelihoods, report, location, forecast }: LikelihoodScoresProps) {
    const sortedLikelihoods = (Object.keys(likelihoods) as Array<keyof Likelihoods>).sort((a, b) => likelihoods[b] - likelihoods[a]);

    const handleDownload = () => {
      if (!forecast) return;

      const headers = [
        "AnalysisType", "DateTime", "Latitude", "Longitude", 
        "Temperature", "Humidity", "WindSpeed",
        "LikelihoodVeryHot", "LikelihoodVeryCold", "LikelihoodVeryWindy",
        "LikelihoodVeryHumid", "LikelihoodUncomfortable", "DetailedReport"
      ];
      
      const formatValue = (value: any) => {
        const stringValue = String(value ?? '');
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      const rowData = [
        forecast.detailedReport.includes("realtime") ? "realtime" : "historical",
        // This is a placeholder as dateTime is not in the output. Consider adding it.
        new Date().toISOString(), 
        location ? location[0] : 'N/A',
        location ? location[1] : 'N/A',
        forecast.currentWeather.temperature,
        forecast.currentWeather.humidity,
        forecast.currentWeather.windSpeed,
        forecast.conditionLikelihoods.veryHot,
        forecast.conditionLikelihoods.veryCold,
        forecast.conditionLikelihoods.veryWindy,
        forecast.conditionLikelihoods.veryHumid,
        forecast.conditionLikelihoods.uncomfortable,
        forecast.detailedReport
      ];

      const csvContent = [
        headers.join(','),
        rowData.map(formatValue).join(',')
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "forecast.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="font-headline">Forecast Summary</CardTitle>
            <CardDescription>Based on historical data and forecast models.</CardDescription>
        </div>
        <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download CSV
        </Button>
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

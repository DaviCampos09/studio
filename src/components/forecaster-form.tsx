"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarIcon, Loader2, Thermometer, Droplets, Wind, Settings2 } from "lucide-react";
import { format } from "date-fns";
import React from 'react';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { forecasterSchema, type ForecasterSchema } from "@/lib/schemas";

interface ForecasterFormProps {
  onFormSubmit: (data: ForecasterSchema) => Promise<void>;
  isLoading: boolean;
}

export function ForecasterForm({ onFormSubmit, isLoading }: ForecasterFormProps) {
  const form = useForm<ForecasterSchema>({
    resolver: zodResolver(forecasterSchema),
    defaultValues: {
      location: "",
      time: "14:00",
      temperature: "",
      humidity: "",
      windSpeed: "",
    },
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline">Event Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-8">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (Coordinates)</FormLabel>
                    <FormDescription>
                      e.g., "40.71, -74.00"
                    </FormDescription>
                    <FormControl>
                      <Input placeholder="Enter latitude, longitude" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time (24h)</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="link" className="p-0 text-accent-foreground/80 hover:text-accent-foreground">
                  <Settings2 className="mr-2 h-4 w-4" />
                  Customize Comfort Thresholds (Optional)
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-4 rounded-md border p-4">
                 <FormField
                    control={form.control}
                    name="temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><Thermometer className="mr-2 h-4 w-4 text-muted-foreground" />Temperature (°C)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 30" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="humidity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><Droplets className="mr-2 h-4 w-4 text-muted-foreground" />Humidity (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 80" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="windSpeed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><Wind className="mr-2 h-4 w-4 text-muted-foreground" />Wind Speed (km/h)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 25" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </CollapsibleContent>
            </Collapsible>

            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Forecasting...
                </>
              ) : (
                "Get Forecast"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

import { z } from "zod";

export const forecasterSchema = z.object({
  location: z.string().min(2, "Please enter a location."),
  eventDetails: z.string().optional(),
  date: z.date({ required_error: "A date for the event is required." }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Please enter a valid time (HH:MM)."),
  temperature: z.string().optional(),
  humidity: z.string().optional(),
  windSpeed: z.string().optional(),
});

export type ForecasterSchema = z.infer<typeof forecasterSchema>;

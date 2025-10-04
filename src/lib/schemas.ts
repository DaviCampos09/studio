import { z } from "zod";

export const forecasterSchema = z.object({
  location: z.string()
    .min(2, "Location must be at least 2 characters.")
    .refine(value => {
        const parts = value.split(',').map(s => s.trim());
        if (parts.length !== 2) return false;
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }, 'Please enter valid coordinates, e.g., "40.71, -74.00"'),
  date: z.date({ required_error: "A date for the event is required." }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Please enter a valid time (HH:MM)."),
  temperature: z.string().optional(),
  humidity: z.string().optional(),
  windSpeed: z.string().optional(),
});

export type ForecasterSchema = z.infer<typeof forecasterSchema>;

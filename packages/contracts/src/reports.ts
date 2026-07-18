import { z } from 'zod';

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const dailyReportQuerySchema = z.object({ date: dateSchema });
export type DailyReportQuery = z.infer<typeof dailyReportQuerySchema>;

export const rangeReportQuerySchema = z.object({
  from: dateSchema,
  to: dateSchema,
}).refine((value) => value.from <= value.to, { path: ['to'], message: 'to must be on or after from' });
export type RangeReportQuery = z.infer<typeof rangeReportQuerySchema>;

export const activityQuerySchema = rangeReportQuerySchema;
export type ActivityQuery = z.infer<typeof activityQuerySchema>;

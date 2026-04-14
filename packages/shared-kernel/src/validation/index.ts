import { z } from 'zod';

/** UUID v4 validation */
export const uuidSchema = z.string().uuid();

/** Pagination query parameters */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

/** ISO 8601 date string */
export const isoDateSchema = z.string().datetime();

/** Date range filter */
export const dateRangeSchema = z.object({
  startDate: z.string().date(),
  endDate: z.string().date(),
});

/** Common sort direction */
export const sortDirectionSchema = z.enum(['asc', 'desc']).default('desc');

export type PaginationParams = z.infer<typeof paginationSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;

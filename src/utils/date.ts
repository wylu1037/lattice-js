import { format } from "date-fns";

export function formatDateToYYYYMMDD(date: Date): string {
  return format(date, "yyyyMMdd");
}
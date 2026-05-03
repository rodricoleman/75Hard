import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, subDays } from 'date-fns';

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function isoDate(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export function fromISO(s: string): Date {
  return parseISO(s);
}

export function lastNDays(n: number): string[] {
  const today = new Date();
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(isoDate(subDays(today, i)));
  return out;
}

export function currentWeekDates(): string[] {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = endOfWeek(new Date(), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end }).map(isoDate);
}

export function prettyDate(iso: string): string {
  return format(parseISO(iso), 'dd/MM');
}

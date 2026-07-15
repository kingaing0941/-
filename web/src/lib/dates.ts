import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

export function todayYmd() {
  return format(new Date(), "yyyy-MM-dd");
}

export function formatMealDate(ymd: string) {
  const normalized = ymd.includes("-")
    ? ymd
    : `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
  return format(parseISO(normalized), "M월 d일 (EEE)", { locale: ko });
}

export function toYmd(value: string) {
  if (value.includes("-")) return value;
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

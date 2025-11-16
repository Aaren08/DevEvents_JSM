import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { IEvent } from "@/database/event.model";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface NormalizedEvent {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}

export const normalizeEvent = (event: IEvent): NormalizedEvent => {
  const eventDate = event.eventStartAt
    ? new Date(event.eventStartAt)
    : new Date();

  const isValid = !isNaN(eventDate.getTime());

  const date = isValid
    ? eventDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Invalid Date";

  const time = isValid
    ? eventDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  return {
    title: event.title,
    image: event.image,
    slug: event.slug,
    location: event.location,
    date,
    time,
  };
};

export const normalizeEvents = (events: IEvent[]): NormalizedEvent[] =>
  events.map(normalizeEvent);

// Convert any non-plain values (ObjectId, Date) to simple primitives
const stringifyIfObject = (val: unknown) => {
  if (
    val &&
    typeof val === "object" &&
    typeof (val as { toString?: () => string }).toString === "function"
  ) {
    try {
      return (val as { toString: () => string }).toString();
    } catch {
      return String(val);
    }
  }
  return val;
};

//  Convert date-like values to ISO string format
const toISOStringIfDateLike = (val: unknown) => {
  if (!val) return val;
  if (typeof val === "string") return val;
  try {
    const d = new Date(val as string | number | Date);
    if (!isNaN(d.getTime())) return d.toISOString();
  } catch {
    // ignore
  }
  return val;
};

//  Serialize events by converting ObjectIds and Dates to strings for safe client-side usage
export function serializeEvents(events: IEvent[]): IEvent[] {
  return events.map((e0: IEvent) => {
    const e = { ...e0 } as Record<string, unknown>;

    return {
      ...e,
      _id: stringifyIfObject(e._id),
      creatorId: stringifyIfObject(e.creatorId),
      eventStartAt: toISOStringIfDateLike(e.eventStartAt),
      createdAt: toISOStringIfDateLike(e.createdAt),
      updatedAt: toISOStringIfDateLike(e.updatedAt),
    } as unknown as IEvent;
  });
}

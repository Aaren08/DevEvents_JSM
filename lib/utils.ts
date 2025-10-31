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

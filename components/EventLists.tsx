import { normalizeEvents } from "@/lib/utils";
import { IEvent } from "@/database/event.model";
import EventCard from "./EventCard";

const EventsList = ({ events }: { events: IEvent[] }) => {
  // Convert all events once
  const normalizedEvents = normalizeEvents(events);

  return (
    <ul className="events list-none">
      {normalizedEvents.map((event) => (
        <li key={event.slug}>
          <EventCard {...event} />
        </li>
      ))}
    </ul>
  );
};

export default EventsList;

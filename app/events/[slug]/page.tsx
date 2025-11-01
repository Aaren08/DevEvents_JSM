import BookEvent from "@/components/BookEvent";
import EventsList from "@/components/EventLists";
import { IEvent } from "@/database";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import Image from "next/image";
import { notFound } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// EVENT DETAIL ITEM
const EventDetailItem = ({
  label,
  alt,
  icon,
}: {
  label: string;
  alt: string;
  icon: string;
}) => (
  <div className="flex-row-gap-2 items-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
);

// EVENT AGENDA
const EventAgenda = ({ agenda }: { agenda: string[] }) => (
  <section className="agenda">
    <h2>Agenda</h2>
    <ul>
      {agenda.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </section>
);

// EVENT TAGS
const EventTags = ({ tags }: { tags: string[] }) => (
  <section className="flex flex-row gap-1.5 flex-wrap">
    {tags.map((tag, index) => (
      <div key={index} className="pill text-[16px]">
        {tag}
      </div>
    ))}
  </section>
);

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const request = await fetch(`${BASE_URL}/api/events/${slug}`);
  const {
    data: {
      description,
      image,
      location,
      eventStartAt,
      overview,
      organizer,
      audience,
      agenda,
      tags,
      mode,
    },
  } = await request.json();

  if (!description) {
    notFound();
  }

  const bookings = 10;

  const similarEvents = (await getSimilarEventsBySlug(
    slug
  )) as unknown as IEvent[];

  return (
    <section id="event">
      <div className="header">
        <h1>Event Description</h1>
        <p>{description}</p>
      </div>

      <div className="details">
        {/* LEFT -- CONTENT */}

        <div className="content">
          <Image
            src={image}
            alt="Event Banner"
            width={800}
            height={800}
            className="banner"
          />
          <section className="flex-col-gap-2">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className="flex-col-gap-2">
            <h2>Event Details</h2>
            <EventDetailItem
              label={eventStartAt.split("T")[0]}
              alt="calendar"
              icon="/icons/calendar.svg"
            />
            <EventDetailItem
              label={eventStartAt.split("T")[1].split(".")[0]}
              alt="clock"
              icon="/icons/clock.svg"
            />
            <EventDetailItem label={location} alt="pin" icon="/icons/pin.svg" />
            <EventDetailItem label={mode} alt="mode" icon="/icons/mode.svg" />
            <EventDetailItem
              label={audience}
              alt="audience"
              icon="/icons/audience.svg"
            />
          </section>

          <EventAgenda agenda={agenda} />

          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>

          <EventTags tags={tags} />
        </div>

        {/* RIGHT -- BOOKING FORM */}
        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Seat</h2>
            {bookings > 0 ? (
              <p>Join {bookings} people who have already booked their seat!</p>
            ) : (
              <p className="text-sm">Be the first one to book your seat</p>
            )}
            <BookEvent />
          </div>
        </aside>
      </div>

      <div className="flex w-full flex-col gap-4 pt-20">
        <h2>Similar Events</h2>
        <div>
          {similarEvents.length > 0 && (
            <EventsList events={similarEvents} /> // ← Single EventsList with all events
          )}
        </div>
      </div>
    </section>
  );
};

export default EventDetailsPage;

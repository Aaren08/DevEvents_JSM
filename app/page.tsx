import EventsList from "@/components/EventLists";
import ExploreBtn from "@/components/ExploreBtn";
import { IEvent } from "@/database/event.model";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Page = async () => {
  const response = await fetch(`${BASE_URL}/api/events`);
  const { events } = await response.json();
  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br />
        Event You Must Attend
      </h1>
      <p className="text-center mt-5">
        Hackathons, Workshops, Conferences, All In One Place
      </p>
      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h3 className="mb-8">Featured Events</h3>
        <EventsList events={events as IEvent[]} />
      </div>
    </section>
  );
};

export default Page;

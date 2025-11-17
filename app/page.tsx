import EventsList from "@/components/EventLists";
import ExploreBtn from "@/components/ExploreBtn";
import { IEvent } from "@/database/event.model";
import { cacheLife } from "next/cache";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";

const Page = async () => {
  "use cache";
  cacheLife("hours");

  // Query the database directly on the server to avoid making an HTTP
  // request to our own API during prerender (which can return an HTML
  // error page on the client and break JSON.parse).
  await connectDB();
  const rawEvents = await Event.find().sort({ createdAt: -1 }).lean();
  const events = rawEvents as unknown as IEvent[];

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
        <EventsList events={events} />
      </div>
    </section>
  );
};

export default Page;

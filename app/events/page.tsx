import { CirclePlus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getUserCreatedEvents } from "@/lib/actions/event.actions";
import ManageEvent from "@/components/ManageEvent";
import { serializeEvents } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

/**
 * Events Content Component
 * Handles the async data fetching
 */
async function EventsContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  // Fetch user's created events with pagination
  const eventsData = await getUserCreatedEvents(page, 10);

  // Redirect to home if user is not authenticated
  if (!eventsData) {
    redirect("/");
  }

  const serializedEvents = serializeEvents(eventsData.events);

  return (
    <ManageEvent
      initialEvents={serializedEvents}
      totalPages={eventsData.totalPages}
      currentPage={eventsData.currentPage}
    />
  );
}

/**
 * Events Management Page
 * Displays user's created events with pagination
 * Requires authentication
 */
const Page = async ({ searchParams }: PageProps) => {
  return (
    <>
      <div className="flex justify-between w-full max-lg:mx-0 max-sm:flex-col items-center mt-8 mb-4">
        <h1 className="text-center max-lg:text-4xl max-lg:mt-4 max-sm:text-5xl max-sm:text-start mb-6">
          Event Management
        </h1>
        <button className="add-event-btn flex-center max-sm:mt-2 max-sm:w-100">
          <Link href="/create-event" className="flex items-center">
            <span className="mr-2 flex items-center">
              <CirclePlus />
            </span>
            Add New Event
          </Link>
        </button>
      </div>

      <Suspense>
        <EventsContent searchParams={searchParams} />
      </Suspense>
    </>
  );
};

export default Page;

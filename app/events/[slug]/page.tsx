import { Suspense } from "react";
import EventDetails from "@/components/EventDetails";
import EventDetailsSkeleton from "@/components/EventDetailsSkeleton";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const EventDetailsPage = ({ params }: PageProps) => {
  return (
    <Suspense fallback={<EventDetailsSkeleton />}>
      <EventDetailsWrapper params={params} />
    </Suspense>
  );
};

// This wrapper component handles the params awaiting
const EventDetailsWrapper = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  return <EventDetails slug={slug} />;
};

export default EventDetailsPage;

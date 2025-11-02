import { Skeleton } from "@/components/ui/skeleton";

const EventDetailsSkeleton = () => (
  <section id="event">
    <div className="header">
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-full" />
    </div>

    <div className="details">
      <div className="content">
        <Skeleton className="h-64 mb-4" />

        <section className="flex-col-gap-2 mb-4">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-full" />
        </section>

        <section className="flex-col-gap-2 mb-4">
          <Skeleton className="h-6 w-32 mb-2" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
        </section>
      </div>

      <aside className="booking">
        <div className="signup-card">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48 mb-4" />
          <Skeleton className="h-10" />
        </div>
      </aside>
    </div>
  </section>
);

export default EventDetailsSkeleton;

import EventForm from "@/components/EventForm";
import { Suspense } from "react";

const Page = async () => {
  return (
    <div className="flex flex-col w-full mt-8">
      <h1 className="text-center max-sm:text-start">Create an Event</h1>
      <Suspense>
        <EventForm />
      </Suspense>
    </div>
  );
};

export default Page;

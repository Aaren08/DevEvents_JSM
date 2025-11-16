import EventForm from "@/components/EventForm";
import { requireAuth } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const Page = async () => {
  // Check if user is authenticated on server-side
  const user = await requireAuth();

  // Redirect to home if not authenticated
  if (!user) {
    redirect("/");
  }

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

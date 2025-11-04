import EventForm from "@/components/EventForm";

const Page = () => {
  return (
    <div className="flex flex-col w-full mt-8">
      <h1 className="text-center max-sm:text-start">Create an Event</h1>
      <EventForm />
    </div>
  );
};

export default Page;

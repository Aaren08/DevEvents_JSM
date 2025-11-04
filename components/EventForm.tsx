"use client";

import { useActionState, useRef, useState, useEffect } from "react";
import { createEventAction, CreateEventState } from "@/lib/actions/createEvent";
import Image from "next/image";
import { toast } from "sonner";

const initialState: CreateEventState = {
  success: false,
  message: "",
};

const EventForm = () => {
  const [state, formAction, isPending] = useActionState(
    createEventAction,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const prevMessageRef = useRef<string>("");
  const [fileName, setFileName] = useState<string>("");

  // Handle file input change to show file name
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName("");
    }
  };

  // Reset form after successful submission
  useEffect(() => {
    if (state.message && state.message !== prevMessageRef.current) {
      prevMessageRef.current = state.message;
      if (state.success) {
        toast.success(state.message, {
          position: "top-right",
          style: {
            background: "white",
            color: "black",
            border: "1px solid #e5e5e5",
          },
        });
        // Reset form after successful submission
        if (formRef.current) {
          formRef.current.reset();
          // Cascading setTimeout to ensure file input resets
          setTimeout(() => {
            setFileName("");
          }, 0);
        }
      } else {
        toast.error(state.message, {
          position: "top-right",
          style: {
            background: "#ef4444",
            color: "white",
            border: "1px solid #dc2626",
          },
        });
      }
    }
  }, [state]);

  return (
    <div id="create-event-form">
      <div className="event-form-container">
        <form ref={formRef} action={formAction}>
          {/* Event Title */}
          <div className="form-field">
            <label htmlFor="title">Event Title</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Enter event title"
              required
              disabled={isPending}
            />
            {state.errors?.title && (
              <span className="text-red-500 text-xs">{state.errors.title}</span>
            )}
          </div>

          <div className="form-row">
            {/* Event Date */}
            <div className="form-field">
              <label htmlFor="date">Event Date</label>
              <div className="input-with-icon">
                <Image
                  src="/icons/calendar.svg"
                  alt="Calendar"
                  width={20}
                  height={20}
                />
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  disabled={isPending}
                />
              </div>
              {state.errors?.date && (
                <span className="text-red-500 text-xs">
                  {state.errors.date}
                </span>
              )}
            </div>

            {/* Event Time */}
            <div className="form-field">
              <label htmlFor="time">Event Time</label>
              <div className="input-with-icon">
                <Image
                  src="/icons/clock.svg"
                  alt="Clock"
                  width={20}
                  height={20}
                />
                <input
                  type="time"
                  id="time"
                  name="time"
                  required
                  disabled={isPending}
                />
              </div>
              {state.errors?.time && (
                <span className="text-red-500 text-xs">
                  {state.errors.time}
                </span>
              )}
            </div>
          </div>

          {/* Venue */}
          <div className="form-field">
            <label htmlFor="venue">Venue</label>
            <div className="input-with-icon">
              <Image
                src="/icons/pin.svg"
                alt="Location"
                width={20}
                height={20}
              />
              <input
                type="text"
                id="venue"
                name="venue"
                placeholder="Enter venue or online link"
                required
                disabled={isPending}
              />
            </div>
            {state.errors?.venue && (
              <span className="text-red-500 text-xs">{state.errors.venue}</span>
            )}
          </div>

          {/* Event Type */}
          <div className="form-field">
            <label htmlFor="eventType">Event Type</label>
            <select
              id="eventType"
              name="eventType"
              required
              disabled={isPending}
              defaultValue=""
            >
              <option value="" disabled>
                Select event type
              </option>
              <option value="conference">Conference</option>
              <option value="workshop">Workshop</option>
              <option value="meetup">Meetup</option>
              <option value="webinar">Webinar</option>
              <option value="seminar">Seminar</option>
              <option value="hackathon">Hackathon</option>
              <option value="networking">Networking</option>
              <option value="other">Other</option>
            </select>
            {state.errors?.eventType && (
              <span className="text-red-500 text-xs">
                {state.errors.eventType}
              </span>
            )}
          </div>

          {/* Event Image */}
          <div className="form-field">
            <label htmlFor="image">Event Image / Banner</label>
            <div className="relative">
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                required
                disabled={isPending}
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="image"
                className="flex items-center justify-center gap-2 bg-dark-200 rounded-[6px] px-4 py-2.5 cursor-pointer border border-transparent hover:border-primary/50 transition-colors"
              >
                <Image
                  src="/icons/cloud-upload.svg"
                  alt="Upload"
                  width={20}
                  height={20}
                  className="opacity-70"
                />
                <span className="text-light-200">
                  {fileName || "Upload event image or banner"}
                </span>
              </label>
            </div>
            {state.errors?.image && (
              <span className="text-red-500 text-xs">{state.errors.image}</span>
            )}
          </div>

          {/* Tags */}
          <div className="form-field">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              placeholder="Add tags such as ai, blockchain, etc."
              required
              disabled={isPending}
            />
            {state.errors?.tags && (
              <span className="text-red-500 text-xs">{state.errors.tags}</span>
            )}
          </div>

          {/* Event Description */}
          <div className="form-field">
            <label htmlFor="description">Event Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Briefly describe the event"
              required
              disabled={isPending}
            />
            {state.errors?.description && (
              <span className="text-red-500 text-xs">
                {state.errors.description}
              </span>
            )}
          </div>

          {/* Overview */}
          <div className="form-field">
            <label htmlFor="overview">Overview</label>
            <input
              type="text"
              id="overview"
              name="overview"
              placeholder="Brief overview of the event"
              required
              disabled={isPending}
            />
            {state.errors?.overview && (
              <span className="text-red-500 text-xs">
                {state.errors.overview}
              </span>
            )}
          </div>

          {/* Location */}
          <div className="form-field">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="City, Country"
              required
              disabled={isPending}
            />
            {state.errors?.location && (
              <span className="text-red-500 text-xs">
                {state.errors.location}
              </span>
            )}
          </div>

          {/* Mode */}
          <div className="form-field">
            <label htmlFor="mode">Mode</label>
            <input
              type="text"
              id="mode"
              name="mode"
              placeholder="e.g. Online, Offline, Hybrid"
              required
              disabled={isPending}
            />
            {state.errors?.mode && (
              <span className="text-red-500 text-xs">{state.errors.mode}</span>
            )}
          </div>

          {/* Audience */}
          <div className="form-field">
            <label htmlFor="audience">Audience</label>
            <input
              type="text"
              id="audience"
              name="audience"
              placeholder="Target audience"
              required
              disabled={isPending}
            />
            {state.errors?.audience && (
              <span className="text-red-500 text-xs">
                {state.errors.audience}
              </span>
            )}
          </div>

          {/* Agenda */}
          <div className="form-field">
            <label htmlFor="agenda">Agenda</label>
            <textarea
              id="agenda"
              name="agenda"
              placeholder="Event agenda items (comma-separated)"
              required
              disabled={isPending}
            />
            {state.errors?.agenda && (
              <span className="text-red-500 text-xs">
                {state.errors.agenda}
              </span>
            )}
          </div>

          {/* Organizer */}
          <div className="form-field">
            <label htmlFor="organizer">Organizer</label>
            <input
              type="text"
              id="organizer"
              name="organizer"
              placeholder="Event organizer name"
              required
              disabled={isPending}
            />
            {state.errors?.organizer && (
              <span className="text-red-500 text-xs">
                {state.errors.organizer}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                Saving Event<span className="loader"></span>
              </>
            ) : (
              "Save Event"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventForm;

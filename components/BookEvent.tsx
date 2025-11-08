"use client";

import { createBooking } from "@/lib/actions/booking.actions";
import { useSession } from "@/lib/auth-client";
import posthog from "posthog-js";
import { useState } from "react";
import { toast } from "sonner";

const BookEvent = ({ eventId, slug }: { eventId: string; slug: string }) => {
  const { data: session, isPending: isSessionLoading } = useSession();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!session?.user) {
      toast.error("Please sign in to book an event", {
        position: "top-center",
        style: {
          background: "#ef4444",
          color: "white",
          border: "1px solid #dc2626",
        },
      });
      return;
    }

    // Validate email
    if (!email || !email.trim()) {
      toast.error("Please enter your email address", {
        position: "top-center",
        style: {
          background: "#ef4444",
          color: "white",
          border: "1px solid #dc2626",
        },
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createBooking({ eventId, slug, email });

      if (result.success) {
        setSubmitted(true);
        toast.success(result.message || "Booking successful!", {
          position: "top-center",
          style: {
            background: "white",
            color: "black",
            border: "1px solid #e5e5e5",
          },
        });
        // Track booking event here
        posthog.capture("event_booked", {
          eventId,
          slug,
          email,
        });
      } else {
        toast.error(result.message || "Booking failed", {
          position: "top-center",
          style: {
            background: "#ef4444",
            color: "white",
            border: "1px solid #dc2626",
          },
        });
        console.error("Booking creation failed");
        posthog.captureException("Booking creation failed");
      }
    } catch (error) {
      toast.error("An unexpected error occurred", {
        position: "top-center",
        style: {
          background: "#ef4444",
          color: "white",
          border: "1px solid #dc2626",
        },
      });
      console.error("Booking error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="book-event">
      {submitted ? (
        <p className="text-sm">Thank you for signing up!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              placeholder="Enter your email address"
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting || isSessionLoading}
            />
          </div>

          <button
            type="submit"
            className="button-submit"
            disabled={isSubmitting || isSessionLoading}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      )}
    </div>
  );
};

export default BookEvent;

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IEvent } from "@/database/event.model";
import { getBookingCount } from "@/lib/actions/booking.actions";
import Image from "next/image";
import EditEvent from "./EditEvent";
import DeleteEvent from "./DeleteEvent";
import { Button } from "./ui/button";

interface ManageEventProps {
  initialEvents: IEvent[];
  totalPages: number;
  currentPage: number;
}

interface EventWithBookings extends IEvent {
  bookingCount: number;
}

/**
 * ManageEvent Component
 * Displays a table of user's created events with pagination
 * Integrates Edit and Delete functionality
 */
export default function ManageEvent({
  initialEvents,
  totalPages,
  currentPage,
}: ManageEventProps) {
  const [events, setEvents] = useState<EventWithBookings[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(currentPage);
  const router = useRouter();

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Fetch booking counts for all events
  useEffect(() => {
    const fetchBookingCounts = async () => {
      setLoading(true);
      try {
        const eventsWithBookings = await Promise.all(
          initialEvents.map(async (event) => {
            const bookingCount = await getBookingCount(event._id.toString());
            // Convert to plain object to strip Mongoose instance methods
            const plainEvent = JSON.parse(JSON.stringify(event));
            return { ...plainEvent, bookingCount };
          })
        );
        setEvents(eventsWithBookings as EventWithBookings[]);
      } catch (error) {
        console.error("Error fetching booking counts:", error);
        setEvents(
          initialEvents.map((event) => ({
            ...JSON.parse(JSON.stringify(event)),
            bookingCount: 0,
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookingCounts();
  }, [initialEvents]);

  const handleEdit = (event: IEvent) => {
    setSelectedEvent(event);
    setEditDialogOpen(true);
  };

  const handleDelete = (eventId: string, eventTitle: string) => {
    setEventToDelete({ id: eventId, title: eventTitle });
    setDeleteDialogOpen(true);
  };

  const handleEditSuccess = () => {
    // Refresh the page to show updated data
    router.refresh();
  };

  const handleDeleteSuccess = () => {
    // Refresh the page to show updated data
    router.refresh();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      router.push(`/events?page=${newPage}`);
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date: Date): string => {
    const start = new Date(date);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // Assume 2 hours duration

    const formatTimeString = (d: Date) =>
      d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

    return `${formatTimeString(start)} - ${formatTimeString(end)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="loader"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <video
          src="/icons/no-data.webm"
          autoPlay
          loop
          muted
          playsInline
          className="w-80 h-80"
          preload="auto"
        />
        <p className="text-light-200 text-sm mt-4">
          Create your first event to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="event-management-container">
        {/* Table - Scrollable on mobile */}
        <div className="overflow-x-auto">
          <table className="event-table">
            <thead>
              <tr>
                <th>Events</th>
                <th>Location</th>
                <th>Date</th>
                <th>Time</th>
                <th>Booked Spot</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event._id.toString()}>
                  {/* Event with Image */}
                  <td>
                    <div className="event-cell">
                      <div className="event-image-wrapper">
                        <Image
                          src={event.image}
                          alt={event.title}
                          width={48}
                          height={48}
                          className="event-image"
                        />
                      </div>
                      <span className="event-title">{event.title}</span>
                    </div>
                  </td>

                  {/* Location */}
                  <td>{event.location}</td>

                  {/* Date */}
                  <td>{formatDate(event.eventStartAt)}</td>

                  {/* Time */}
                  <td>{formatTime(event.eventStartAt)}</td>

                  {/* Booked Spot */}
                  <td className="text-center">{event.bookingCount}</td>

                  {/* Manage Actions */}
                  <td>
                    <div className="manage-actions">
                      <button
                        onClick={() => handleEdit(event)}
                        className="edit-link"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(event._id.toString(), event.title)
                        }
                        className="delete-link"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination-container">
          <Button
            variant="outline"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="pagination-btn"
          >
            Previous
          </Button>

          <span className="pagination-info">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="pagination-btn"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      {selectedEvent && (
        <EditEvent
          event={selectedEvent}
          isOpen={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedEvent(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Dialog */}
      {eventToDelete && (
        <DeleteEvent
          eventId={eventToDelete.id}
          eventTitle={eventToDelete.title}
          isOpen={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setEventToDelete(null);
          }}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}

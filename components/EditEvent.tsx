"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { toast } from "sonner";
import { IEvent } from "@/database/event.model";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import posthog from "posthog-js";

interface EditEventProps {
  event: IEvent;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * EditEvent Component
 * Displays a dialog with a form to edit event details
 * Includes image upload functionality
 */
export default function EditEvent({
  event,
  isOpen,
  onClose,
  onSuccess,
}: EditEventProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(event.image);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    overview: event.overview,
    venue: event.venue,
    eventStartAt: new Date(event.eventStartAt).toISOString().slice(0, 16),
    location: event.location,
    mode: event.mode,
    audience: event.audience,
    agenda: event.agenda.join("\n"),
    organizer: event.organizer,
    tags: event.tags.join(", "),
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB", {
          position: "top-right",
        });
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("id", event._id.toString());
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("overview", formData.overview);
      submitData.append("venue", formData.venue);
      submitData.append(
        "eventStartAt",
        new Date(formData.eventStartAt).toISOString()
      );
      submitData.append("location", formData.location);
      submitData.append("mode", formData.mode);
      submitData.append("audience", formData.audience);
      submitData.append("organizer", formData.organizer);

      // Parse and append agenda
      const agendaArray = formData.agenda
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
      submitData.append("agenda", JSON.stringify(agendaArray));

      // Parse and append tags
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
      submitData.append("tags", JSON.stringify(tagsArray));

      // Append image if a new one is selected
      if (selectedImage) {
        submitData.append("image", selectedImage);
      }

      const response = await fetch("/api/events", {
        method: "PUT",
        body: submitData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update event");
      }

      toast.success("Event updated successfully", {
        style: {
          background: "#ffffff",
          color: "#000000",
          border: "1px solid #e5e7eb",
        },
        position: "top-right",
      });

      // Track event edit here
      posthog.capture("event_edited", {
        event_id: event._id.toString(),
        title: formData.title,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update event",
        {
          position: "top-right",
        }
      );
      posthog.captureException("Booking update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dialog-content max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 px-6 pt-6">
            <DialogTitle className="text-2xl font-semibold text-light-100">
              Edit Event
            </DialogTitle>
          </DialogHeader>

          <SimpleBar
            style={{ maxHeight: "calc(90vh - 160px)" }}
            className="flex-1"
          >
            <div className="px-6 py-4">
              <div className="form-container">
                {/* All your existing form fields */}
                {/* Event Image */}
                <div className="form-field">
                  <label htmlFor="image">Event Image</label>
                  <div className="flex flex-col gap-3">
                    {imagePreview && (
                      <div className="image-preview-container">
                        <Image
                          src={imagePreview}
                          alt="Event preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <p className="form-helper-text">
                      Maximum file size: 5MB. Supported formats: JPG, PNG, WebP
                    </p>
                  </div>
                </div>

                {/* Title */}
                <div className="form-field">
                  <label htmlFor="title">Event Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter event title"
                  />
                </div>

                {/* Description */}
                <div className="form-field">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Provide a brief description of the event"
                    rows={3}
                  />
                </div>

                {/* Overview */}
                <div className="form-field">
                  <label htmlFor="overview">Overview</label>
                  <textarea
                    id="overview"
                    name="overview"
                    value={formData.overview}
                    onChange={handleInputChange}
                    required
                    placeholder="Provide a detailed overview of the event"
                    rows={3}
                  />
                </div>

                {/* Venue and Location */}
                <div className="form-grid-2">
                  <div className="form-field">
                    <label htmlFor="venue">Venue</label>
                    <input
                      type="text"
                      id="venue"
                      name="venue"
                      value={formData.venue}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter venue name"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="location">Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                {/* Event Date and Time */}
                <div className="form-field">
                  <label htmlFor="eventStartAt">Event Date & Time</label>
                  <input
                    type="datetime-local"
                    id="eventStartAt"
                    name="eventStartAt"
                    value={formData.eventStartAt}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Mode and Audience */}
                <div className="form-grid-2">
                  <div className="form-field">
                    <label htmlFor="mode">Mode</label>
                    <select
                      id="mode"
                      name="mode"
                      value={formData.mode}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="" disabled>
                        Select mode
                      </option>
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="audience">Audience</label>
                    <input
                      type="text"
                      id="audience"
                      name="audience"
                      value={formData.audience}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Developers, Designers"
                    />
                  </div>
                </div>

                {/* Organizer */}
                <div className="form-field">
                  <label htmlFor="organizer">Organizer</label>
                  <input
                    type="text"
                    id="organizer"
                    name="organizer"
                    value={formData.organizer}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter organizer name"
                  />
                </div>

                {/* Agenda */}
                <div className="form-field">
                  <label htmlFor="agenda">Agenda</label>
                  <textarea
                    id="agenda"
                    name="agenda"
                    value={formData.agenda}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter agenda items, one per line"
                    rows={4}
                  />
                  <p className="form-helper-text">
                    Enter each agenda item on a new line
                  </p>
                </div>

                {/* Tags */}
                <div className="form-field">
                  <label htmlFor="tags">Tags</label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., tech, conference, networking"
                  />
                  <p className="form-helper-text">Separate tags with commas</p>
                </div>
              </div>
            </div>
          </SimpleBar>

          <DialogFooter className="dialog-footer flex-shrink-0 px-6 pb-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

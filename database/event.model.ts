import { Schema, model, models, Document } from "mongoose";

// TypeScript interface for Event document
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  eventStartAt: Date; // Used for both date & time
  location: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, "Overview is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image is required"],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    eventStartAt: {
      type: Date,
      required: [true, "Event start date and time are required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    mode: {
      type: String,
      required: [true, "Mode is required"],
      trim: true,
    },
    audience: {
      type: String,
      required: [true, "Audience is required"],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: "Agenda must contain at least one item",
      },
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: "Tags must contain at least one item",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Helper function to generate a URL-friendly slug
function generateSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Append random suffix to reduce slug collision risk
  const uniqueSuffix = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${uniqueSuffix}`;
}

// Pre-save hook to generate slug and normalize eventStartAt
EventSchema.pre<IEvent>("save", function (next) {
  if (this.isModified("title") || !this.slug) {
    this.slug = generateSlug(this.title);
  }

  // Ensure eventStartAt is a valid date
  if (isNaN(this.eventStartAt.getTime())) {
    return next(new Error("Invalid event start date"));
  }

  next();
});

// Apply same logic for findOneAndUpdate and updateOne
EventSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
  const update = this.getUpdate() as Partial<IEvent>;

  if (update?.title) {
    update.slug = generateSlug(update.title);
  }

  if (update?.eventStartAt && isNaN(new Date(update.eventStartAt).getTime())) {
    return next(new Error("Invalid event start date"));
  }

  this.setUpdate(update);
  next();
});

// Use existing model if available (prevents OverwriteModelError in dev)
const Event = models.Event || model<IEvent>("Event", EventSchema);

export default Event;

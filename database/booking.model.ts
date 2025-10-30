import { Schema, model, models, Document, Types } from "mongoose";
import Event from "./event.model";

// TypeScript interface for Booking document
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event", // Reference to Event model
      required: [true, "Event ID is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email: string) {
          // Basic, safer email validation: prevents consecutive dots and enforces simple local@domain.tld shape
          const simpleEmail = /^[^\s@.][^\s@]*@[^\s@.]+\.[^\s@.]{2,}$/;
          if (!simpleEmail.test(email)) return false;
          // Disallow consecutive dots anywhere
          if (email.includes('..')) return false;
          return true;
        },
        message: "Please provide a valid email address",
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Create index on eventId for faster queries when fetching bookings by event
BookingSchema.index({ eventId: 1 });

/**
 * Pre-save hook to validate event reference
 * - Verifies that the referenced eventId exists in the Event collection
 * - Prevents orphaned bookings by ensuring referential integrity
 * - Throws error if event does not exist
 */
BookingSchema.pre("save", async function (next) {
  if (this.isModified("eventId") && this.eventId) {
    try {
      const idStr = this.eventId.toString();
      if (!Types.ObjectId.isValid(idStr)) {
        return next(new Error("Invalid eventId format"));
      }

      const count = await Event.countDocuments({ _id: idStr }).maxTimeMS(500);
      if (count === 0) {
        return next(new Error("Referenced event does not exist"));
      }
    } catch (err) {
      return next(new Error("Failed to validate event reference"));
    }
  }
  next();
});

// Use existing model if available (prevents OverwriteModelError in development)
const Booking = models.Booking || model<IBooking>("Booking", BookingSchema);

export default Booking;

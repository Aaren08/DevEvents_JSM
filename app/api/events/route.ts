import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import Event from "@/database/event.model";
import connectDB from "@/lib/mongodb";

// POST request handler to create a new event
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const formData = await req.formData();

    let event;

    try {
      event = Object.fromEntries(formData.entries());
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: "Invalid JSON data format" },
        { status: 400 }
      );
    }

    cloudinary.config({
      secure: true,
    });

    const file = formData.get("image") as File | null;
    if (!file) {
      return NextResponse.json(
        { message: "Image file is required" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadData = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "image", folder: "Dev Event Platform" },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(buffer);
    });
    event.image = (uploadData as { secure_url: string }).secure_url;

    const createdEvent = await Event.create(event);
    return NextResponse.json(
      {
        message: "Event Created Successfully",
        event: createdEvent,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        message: "Event Creation Failed",
        error: err instanceof Error ? err.message : "Unknown",
      },
      { status: 500 }
    );
  }
}

// GET request handler to fetch all events
export async function GET() {
  try {
    await connectDB();
    const events = await Event.find().sort({ createdAt: -1 });
    return NextResponse.json({
      message: "Events Fetched Successfully",
      events,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        message: "Event Fetch Failed",
        error: err instanceof Error ? err.message : "Unknown",
      },
      { status: 500 }
    );
  }
}

// Route that accepts a slug as input -> returns the event details

// DELETE request handler to delete an event
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const contentType = req.headers.get("content-type") || "";
    let id;

    if (contentType.includes("application/json")) {
      const body = await req.json();
      id = body.id;
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      id = formData.get("id");
    }

    if (!id) {
      return NextResponse.json(
        { message: "Missing event ID" },
        { status: 400 }
      );
    }

    const deletedEvent = await Event.findByIdAndDelete(id);

    if (deletedEvent?.image) {
      const publicId = deletedEvent.image.split("/").pop()?.split(".")[0];
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    if (!deletedEvent) {
      return NextResponse.json(
        { message: "Event not found", id },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Event Deleted Successfully",
      deletedEvent,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        message: "Event Deletion Failed",
        error: err instanceof Error ? err.message : "Unknown",
      },
      { status: 500 }
    );
  }
}

// PUT request handler to update an event
export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();
    const id = formData.get("id") as string;
    const file = formData.get("image") as File | null;
    const data = Object.fromEntries(formData.entries());

    // Parse array-like fields
    if (typeof data.agenda === "string") {
      try {
        data.agenda = JSON.parse(data.agenda);
      } catch {}
    }
    if (typeof data.tags === "string") {
      try {
        data.tags = JSON.parse(data.tags);
      } catch {}
    }

    // Find existing event before update
    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return NextResponse.json(
        { message: "Event not found", id },
        { status: 404 }
      );
    }

    // Handle new image upload
    if (file && file.size > 0 && file.type.startsWith("image/")) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

      // Extract Cloudinary public_id from existing image URL (if any)
      if (existingEvent.image && existingEvent.image.includes("cloudinary")) {
        try {
          const parts = existingEvent.image.split("/");
          const filename = parts[parts.length - 1];
          const publicId = `events/${filename.split(".")[0]}`;

          // Delete the old image
          await cloudinary.uploader.destroy(publicId);
        } catch (e) {
          console.warn("Failed to delete old Cloudinary image:", e);
        }
      }

      // Upload the new image
      const uploadResponse = await cloudinary.uploader.upload(base64, {
        folder: "events",
        overwrite: true,
      });

      data.image = uploadResponse.secure_url;
    } else {
      delete data.image; // Keep existing image if no new upload
    }

    // Update event document
    const updatedEvent = await Event.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      message: "Event Updated Successfully",
      updatedEvent,
    });
  } catch (err) {
    console.error("Error updating event:", err);
    return NextResponse.json(
      {
        message: "Event Update Failed",
        error: err instanceof Error ? err.message : "Unknown Error",
      },
      { status: 500 }
    );
  }
}

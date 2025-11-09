import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import Event, { IEvent } from "@/database/event.model";
import connectDB from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth-helpers";

// POST request handler to create a new event
export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated by reading server-side session
    const user = await requireAuth();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized. Please sign in to create an event." },
        { status: 401 }
      );
    }

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

    const tags = JSON.parse(formData.get("tags") as string);
    const agenda = JSON.parse(formData.get("agenda") as string);

    // Securely set creatorId from server-side session (cannot be spoofed)
    const creatorId = user.id;

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

    const createdEvent = await Event.create({
      ...event,
      tags: tags,
      agenda: agenda,
      creatorId: creatorId, // Set from server session, not from client
    });
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
    // Verify user is authenticated
    const user = await requireAuth();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

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

    // Atomically find and delete the event, ensuring ownership.
    const deletedEvent = await Event.findOneAndDelete({
      _id: id,
      creatorId: user.id,
    });

    if (!deletedEvent) {
      // To provide a specific error, we can check if the event exists at all.
      // This is safe because the critical delete operation is already atomic.
      const eventExists = await Event.findById(id).select("_id").lean();
      if (!eventExists) {
        return NextResponse.json(
          { message: "Event not found" },
          { status: 404 }
        );
      }
      // If the event exists but wasn't deleted, it's a permission issue.
      return NextResponse.json(
        { message: "Forbidden. You can only delete your own events." },
        { status: 403 }
      );
    }

    if (deletedEvent?.image) {
      const publicId = deletedEvent.image.split("/").pop()?.split(".")[0];
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
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
    // Verify user is authenticated
    const user = await requireAuth();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

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

    // Retrieve old event data first (for Cloudinary cleanup and authorization)
    const existingEvent = (await Event.findOne({
      _id: id,
      creatorId: user.id,
    }).lean()) as IEvent | null;

    if (!existingEvent) {
      const anyEvent = await Event.findById(id);
      if (!anyEvent) {
        return NextResponse.json(
          { message: "Event not found", id },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { message: "Forbidden. You can only update your own events." },
        { status: 403 }
      );
    }

    // Handle new image upload
    if (file && file.size > 0 && file.type.startsWith("image/")) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

      // Upload the new image
      const uploadResponse = await cloudinary.uploader.upload(base64, {
        folder: "events",
        overwrite: true,
      });

      data.image = uploadResponse.secure_url;
    } else {
      delete data.image; // Keep existing image if no new upload
    }

    // Atomic update
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: id, creatorId: user.id },
      data,
      {
        new: true,
        runValidators: true,
      }
    );

    // Delete old Cloudinary image after successful update
    if (
      file &&
      file.size > 0 &&
      existingEvent.image &&
      existingEvent.image.includes("cloudinary")
    ) {
      try {
        const parts = existingEvent.image.split("/");
        const filename = parts[parts.length - 1];
        const publicId = `events/${filename.split(".")[0]}`;

        // Delete the old image asynchronously (don't await)
        cloudinary.uploader.destroy(publicId).catch((e) => {
          console.warn("Failed to delete old Cloudinary image:", e);
        });
      } catch (e) {
        console.warn("Failed to parse old Cloudinary image URL:", e);
      }
    }

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

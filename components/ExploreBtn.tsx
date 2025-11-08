"use client";

import { useSession } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

const ExploreBtn = () => {
  const { data: session } = useSession();
  return (
    <button
      type="button"
      id="explore-btn"
      className="mt-7 mx-auto"
      onClick={() => {
        if (!session) {
          toast.error("Please log in to explore events.");
        }
      }}
    >
      <Link
        href="/events"
        className={!session ? "pointer-events-none" : ""}
        aria-disabled={!session}
      >
        Explore Events
        <Image
          src="/icons/arrow-down.svg"
          alt="arrow-down"
          width={24}
          height={24}
        />
      </Link>
    </button>
  );
};

export default ExploreBtn;

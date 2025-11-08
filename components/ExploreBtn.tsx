"use client";

import { useSession } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

const ExploreBtn = () => {
  const { data: session } = useSession();

  const handleClick = (e: React.MouseEvent) => {
    if (!session) {
      e.preventDefault();
      toast.error("Please log in to explore events.");
    }
  };

  return (
    <Link
      href="/events"
      id="explore-btn"
      className="mt-12 mx-auto block w-fit"
      onClick={handleClick}
    >
      <span className="inline-flex items-center px-2">
        Explore Events
        <Image
          src="/icons/arrow-down.svg"
          alt="arrow-down"
          width={24}
          height={24}
          className="ml-1.5"
        />
      </span>
    </Link>
  );
};

export default ExploreBtn;

"use client";

import Image from "next/image";
import Link from "next/link";
import Login from "./Login";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

const Navbar = () => {
  const { data: session } = useSession();

  const handleRestrictedClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!session) {
      e.preventDefault();
      toast.error("Please log in to access this page.", {
        position: "top-center",
        style: { backgroundColor: "#ef4444", color: "#fff" },
      });
    }
  };
  return (
    <header>
      <nav>
        <Link href="/" className="logo">
          <Image src="/icons/logo.png" alt="logo" width={24} height={24} />
          <p>DevEvent</p>
        </Link>
        <ul>
          <Link href="/">Home</Link>
          <Link onClick={handleRestrictedClick} href="/events">
            Events
          </Link>
          <Link onClick={handleRestrictedClick} href="/create-event">
            Create Event
          </Link>
          <Login />
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;

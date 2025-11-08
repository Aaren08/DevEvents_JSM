"use client";

import { authClient } from "@/lib/auth-client";
import { Skeleton } from "./ui/skeleton";
import Image from "next/image";

const Login = () => {
  const { data: session, isPending } = authClient.useSession();

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  const handleSignOut = async () => {
    await authClient.signOut();
  };
  return (
    <>
      {isPending ? (
        <div>
          <Skeleton className="h-6 w-32 sm:h-8 max-sm:w-8 max-sm:rounded-full" />
        </div>
      ) : session ? (
        <div className="user-profile">
          <Image
            src={session.user.image || "/icons/default-avatar.png"}
            alt={session.user.name || "User"}
            onClick={handleSignOut}
            width={32}
            height={32}
            className="user-avatar cursor-pointer"
          />
          <span className="user-name">{session.user.name}</span>
        </div>
      ) : (
        <button onClick={handleGoogleSignIn} className="login-btn">
          Login
        </button>
      )}
    </>
  );
};

export default Login;

// lib/auth.ts
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getMongoClient } from "./mongodb";

export const auth = betterAuth({
  database: mongodbAdapter(
    // Pass a promise that resolves to the database
    await getMongoClient().then((client) => client.db())
  ),

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      prompt: "select_account", // Always show account selection
    },
  },
});

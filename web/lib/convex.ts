import { ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl)
  throw new Error(
    "Set NEXT_PUBLIC_CONVEX_URL before starting the web application.",
  );
export const convex = new ConvexReactClient(convexUrl);

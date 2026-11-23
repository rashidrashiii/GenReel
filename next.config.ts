import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

// genreel runs on the user's own machine (localhost); there is no hosted deployment.
const nextConfig: NextConfig = { turbopack: { root: fileURLToPath(new URL(".", import.meta.url)) } };

export default nextConfig;

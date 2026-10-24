// Starts the standalone Next.js server bound to all interfaces.
// Hosts like Render set HOSTNAME to the container's name, and the standalone
// server listens on $HOSTNAME, which makes the app unreachable through the proxy.
// BIND_HOST overrides the default if a host ever needs something else.
process.env.HOSTNAME = process.env.BIND_HOST || "0.0.0.0";
process.env.PORT ||= "3000";

console.log(`genfolio: starting on ${process.env.HOSTNAME}:${process.env.PORT}`);
await import("../.next/standalone/server.js");

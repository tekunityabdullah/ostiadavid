"use server";

import { trackKlaviyoEvent } from "@/lib/klaviyo";

// Fired right after a free/regular account is created. Kept as its own
// tiny server action (rather than inlined in the client component) since
// KLAVIYO_PRIVATE_API_KEY is a server-only secret and can't be read from
// client code.
export async function trackAccountCreated(
  email: string,
  firstName?: string,
  lastName?: string
) {
  await trackKlaviyoEvent({
    email,
    metricName: "Account Created",
    firstName,
    lastName,
  });
}

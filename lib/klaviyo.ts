const KLAVIYO_EVENTS_URL = "https://a.klaviyo.com/api/events/";
// Klaviyo requires a fixed API revision date on every request — this pins
// which version of their API shape we're speaking, independent of
// whatever's currently "latest" on their end.
const KLAVIYO_REVISION = "2024-10-15";

interface TrackKlaviyoEventOptions {
  email: string | null | undefined;
  metricName: string;
  properties?: Record<string, unknown>;
  firstName?: string | null;
  lastName?: string | null;
}

// Fires a tracked event into Klaviyo — the four triggers (tour signup,
// order placed, account created, exclusive membership started) all funnel
// through this. Klaviyo itself doesn't send anything on its own; a Flow
// built in the Klaviyo dashboard, triggered off `metricName`, is what
// actually sends the email — this just needs to reliably report that the
// event happened.
//
// Deliberately never throws — a Klaviyo outage or bad key should never be
// able to break checkout/signup/the tour form. Errors are logged instead.
export async function trackKlaviyoEvent({
  email,
  metricName,
  properties,
  firstName,
  lastName,
}: TrackKlaviyoEventOptions): Promise<void> {
  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
  if (!apiKey) {
    console.error(`KLAVIYO_PRIVATE_API_KEY is not set — skipping Klaviyo event "${metricName}".`);
    return;
  }
  if (!email) return;

  const profileAttributes: Record<string, unknown> = { email };
  if (firstName) profileAttributes.first_name = firstName;
  if (lastName) profileAttributes.last_name = lastName;

  try {
    const response = await fetch(KLAVIYO_EVENTS_URL, {
      method: "POST",
      headers: {
        Authorization: `Klaviyo-API-Key ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        revision: KLAVIYO_REVISION,
      },
      body: JSON.stringify({
        data: {
          type: "event",
          attributes: {
            properties: properties ?? {},
            metric: { data: { type: "metric", attributes: { name: metricName } } },
            profile: { data: { type: "profile", attributes: profileAttributes } },
          },
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(`Klaviyo event "${metricName}" failed (${response.status}):`, body);
    }
  } catch (error) {
    console.error(`Failed to send Klaviyo event "${metricName}":`, error);
  }
}

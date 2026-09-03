"use server";

import { trackKlaviyoEvent } from "@/lib/klaviyo";

export type TourFormState = {
  ok: boolean;
  message: string;
};

export async function submitTourEmail(
  _prevState: TourFormState,
  formData: FormData
): Promise<TourFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return { ok: false, message: "Enter a valid email." };
  }

  await trackKlaviyoEvent({
    email,
    metricName: "Tour List Signup",
  });

  return { ok: true, message: "You're on the list." };
}

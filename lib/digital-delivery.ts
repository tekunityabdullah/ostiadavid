import { createServiceClient } from "@/lib/supabase/server";

const DIGITAL_DOWNLOADS_BUCKET = "digital-downloads";
const SIGNED_URL_EXPIRY_SECONDS = 60 * 60 * 48; // 48 hours
const BREVO_SEND_URL = "https://api.brevo.com/v3/smtp/email";

export interface DigitalDeliveryItem {
  productId: string;
  name: string;
  isDigital?: boolean;
}

async function sendViaBrevo(recipientEmail: string, subject: string, html: string) {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    console.error("BREVO_API_KEY or BREVO_FROM_EMAIL is not set — cannot send digital download email.");
    return;
  }

  const response = await fetch(BREVO_SEND_URL, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Osita David", email: fromEmail },
      to: [{ email: recipientEmail }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Brevo API error (${response.status}): ${body}`);
  }
}

// Emails a time-limited download link for each digital item in the order.
// Safe to call with a mixed cart — non-digital items are ignored.
export async function sendDigitalDownloadEmail(
  recipientEmail: string | null | undefined,
  items: DigitalDeliveryItem[]
) {
  const digitalItems = items.filter((i) => i.isDigital);
  if (!digitalItems.length || !recipientEmail) return;

  const supabase = await createServiceClient();
  const links: { name: string; url: string }[] = [];

  for (const item of digitalItems) {
    const { data: product } = await supabase
      .from("products")
      .select("digital_file_path")
      .eq("id", item.productId)
      .single();

    if (!product?.digital_file_path) continue;

    const { data: signed, error } = await supabase.storage
      .from(DIGITAL_DOWNLOADS_BUCKET)
      .createSignedUrl(product.digital_file_path, SIGNED_URL_EXPIRY_SECONDS, {
        download: true,
      });

    if (error || !signed?.signedUrl) {
      console.error("Failed to create signed URL for digital download:", error);
      continue;
    }

    links.push({ name: item.name, url: signed.signedUrl });
  }

  if (!links.length) return;

  const html = `
    <div style="font-family: Arial, sans-serif; background:#000000; color:#ffffff; padding:32px;">
      <h1 style="font-size:20px; text-transform:uppercase; letter-spacing:0.05em; margin:0 0 12px;">Thanks for your purchase</h1>
      <p style="font-size:14px; color:#cccccc; margin:0 0 24px;">
        Your download${links.length > 1 ? "s are" : " is"} ready below. Link${links.length > 1 ? "s" : ""} expire in 48 hours.
      </p>
      ${links
        .map(
          (l) => `
        <p style="margin:0 0 20px;">
          <strong style="text-transform:uppercase; letter-spacing:0.03em;">${l.name}</strong><br/>
          <a href="${l.url}" style="color:#ffffff; text-decoration:underline;">Download WAV file</a>
        </p>`
        )
        .join("")}
    </div>
  `;

  try {
    await sendViaBrevo(recipientEmail, "Your download is ready", html);
  } catch (error) {
    console.error("Failed to send digital download email:", error);
  }
}

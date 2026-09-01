import type { Metadata } from "next";
import Header from "../components/Header";
import SubNav from "../components/SubNav";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Osita David - Privacy Policy",
};

const SECTIONS = [
  {
    heading: "1. Information We Collect",
    body: "We collect information you provide directly to us, such as your name, email address, shipping address, and payment information when you create an account, place an order, or sign up for Exclusive membership. We also automatically collect certain information about your device and how you interact with our website, such as your IP address, browser type, and pages visited.",
  },
  {
    heading: "2. How We Use Your Information",
    body: "We use the information we collect to process your orders, manage your account, provide access to Exclusive content, communicate with you, improve our website, and comply with legal obligations.",
  },
  {
    heading: "3. Sharing Your Information",
    body: "We do not sell your personal information. We may share your information with third-party service providers who help us operate our website, process payments, and fulfill orders, solely for the purpose of providing those services. We may also disclose information when required by law.",
  },
  {
    heading: "4. Cookies",
    body: "This website uses cookies and similar technologies to improve your browsing experience, remember your preferences, and analyze site traffic. For more details, please see our Cookies policy.",
  },
  {
    heading: "5. Data Security",
    body: "We take reasonable measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.",
  },
  {
    heading: "6. Your Rights",
    body: "Depending on your location, you may have the right to access, correct, delete, or restrict the use of your personal information. To exercise these rights, please contact us using the information provided on this website.",
  },
  {
    heading: "7. Children's Privacy",
    body: "This website is not directed to individuals under the age of 13, and we do not knowingly collect personal information from children.",
  },
  {
    heading: "8. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.",
  },
  {
    heading: "9. Contact Us",
    body: "If you have any questions about this Privacy Policy, please contact us using the contact information provided on this website.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <SubNav />

      <main className="pt-32 flex justify-center w-full max-w-[1400px] mx-auto flex-1">
        <section className="flex flex-col items-center px-4 pt-6 pb-16 w-full">
          <div className="w-full max-w-2xl font-sans uppercase tracking-normal text-white">
            <h1 className="mb-2 text-xl font-medium text-center sm:text-2xl">Privacy Policy</h1>
            <p className="mb-10 text-center text-xs text-white">
              Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>

            <div className="flex flex-col gap-8 text-xs leading-relaxed sm:text-sm">
              {SECTIONS.map((s) => (
                <div key={s.heading}>
                  <h2 className="mb-2 font-medium">{s.heading}</h2>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

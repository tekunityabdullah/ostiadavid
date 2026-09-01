import type { Metadata } from "next";
import Header from "../components/Header";
import SubNav from "../components/SubNav";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Osita David - Do Not Sell My Information",
};

const SECTIONS = [
  {
    heading: "1. Your Right to Opt Out",
    body: "Depending on your state or jurisdiction, you may have the right to opt out of the \"sale\" or \"sharing\" of your personal information. We do not sell your personal information for money. To the extent that any of our data practices are considered a \"sale\" or \"sharing\" under applicable law, you have the right to opt out.",
  },
  {
    heading: "2. What \"Sale\" Means Under Applicable Law",
    body: "Certain privacy laws define \"sale\" broadly to include some forms of sharing data with third parties, such as advertising and analytics partners, even without an exchange of money. We limit the sharing of your information to what is necessary to operate this website and provide our services.",
  },
  {
    heading: "3. How to Exercise Your Rights",
    body: "You may submit a request to opt out of the sale or sharing of your personal information by contacting us using the contact information provided on this website. Please include enough detail for us to verify your request.",
  },
  {
    heading: "4. Verification",
    body: "To protect your privacy, we may need to verify your identity before processing your request. We will only use the information provided for verification purposes.",
  },
  {
    heading: "5. Non-Discrimination",
    body: "We will not discriminate against you for exercising your privacy rights. You will not be denied goods or services, charged different prices, or provided a different level of service as a result of submitting a request.",
  },
  {
    heading: "6. Contact",
    body: "If you have any questions about this policy or wish to exercise your rights, please contact us using the contact information provided on this website.",
  },
];

export default function DoNotSellPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <SubNav />

      <main className="pt-32 flex justify-center w-full max-w-[1400px] mx-auto flex-1">
        <section className="flex flex-col items-center px-4 pt-6 pb-16 w-full">
          <div className="w-full max-w-2xl font-sans uppercase tracking-normal text-white">
            <h1 className="mb-2 text-xl font-medium text-center sm:text-2xl">
              Do Not Sell My Information
            </h1>
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

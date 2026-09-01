import type { Metadata } from "next";
import Header from "../components/Header";
import SubNav from "../components/SubNav";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Osita David - Terms & Conditions",
};

const SECTIONS = [
  {
    heading: "1. Acceptance of Terms",
    body: "By accessing or using this website, you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree to these terms, please do not use this website.",
  },
  {
    heading: "2. Use of the Site",
    body: "You agree to use this website only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use of the site. You must not attempt to gain unauthorized access to any part of this website, the server on which it is stored, or any server, computer, or database connected to it.",
  },
  {
    heading: "3. Products & Purchases",
    body: "All products listed on this website are subject to availability. We reserve the right to limit quantities, discontinue products, or refuse any order at our discretion. Prices are subject to change without notice. By placing an order, you represent that the information you provide is accurate and complete.",
  },
  {
    heading: "4. Exclusive Membership",
    body: "Access to Exclusive content and products is granted through a paid membership. Membership fees are billed on a recurring basis until cancelled. You may cancel your membership at any time; cancellation takes effect immediately, and access to Exclusive content ends upon cancellation.",
  },
  {
    heading: "5. Intellectual Property",
    body: "All content on this website, including but not limited to music, video, images, logos, artwork, and text, is the property of Osita David and/or its licensors and is protected by copyright and other intellectual property laws. Unauthorized reproduction, distribution, or use of this content is strictly prohibited.",
  },
  {
    heading: "6. User Accounts",
    body: "You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to notify us immediately of any unauthorized use of your account.",
  },
  {
    heading: "7. Limitation of Liability",
    body: "This website and its content are provided on an \"as is\" and \"as available\" basis without warranties of any kind. To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages arising from your use of this website.",
  },
  {
    heading: "8. Changes to These Terms",
    body: "We reserve the right to update or modify these Terms & Conditions at any time without prior notice. Continued use of the website after any changes constitutes acceptance of the new terms.",
  },
  {
    heading: "9. Governing Law",
    body: "These terms shall be governed by and construed in accordance with the laws of the applicable jurisdiction, without regard to its conflict of law provisions.",
  },
  {
    heading: "10. Contact",
    body: "If you have any questions about these Terms & Conditions, please contact us using the contact information provided on this website.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <SubNav />

      <main className="pt-32 flex justify-center w-full max-w-[1400px] mx-auto flex-1">
        <section className="flex flex-col items-center px-4 pt-6 pb-16 w-full">
          <div className="w-full max-w-2xl font-sans uppercase tracking-normal text-white">
            <h1 className="mb-2 text-xl font-medium text-center sm:text-2xl">
              Terms &amp; Conditions
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

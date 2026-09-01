import type { Metadata } from "next";
import Header from "../components/Header";
import SubNav from "../components/SubNav";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Osita David - Cookies",
};

const SECTIONS = [
  {
    heading: "1. What Are Cookies",
    body: "Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the website owner.",
  },
  {
    heading: "2. How We Use Cookies",
    body: "We use cookies to remember your preferences, keep you signed in, understand how you use our website, and improve your overall experience. Some cookies are essential for the website to function properly.",
  },
  {
    heading: "3. Types of Cookies We Use",
    body: "Essential cookies are required for core site functionality, such as staying signed in and keeping items in your cart. Performance and analytics cookies help us understand how visitors interact with our website so we can improve it. Preference cookies remember choices you make, such as your account type or recently viewed content.",
  },
  {
    heading: "4. Managing Cookies",
    body: "Most web browsers allow you to control cookies through their settings. You can choose to block or delete cookies at any time; however, doing so may affect the functionality of this website.",
  },
  {
    heading: "5. Changes to This Policy",
    body: "We may update this Cookies policy from time to time to reflect changes in technology, law, or our data practices. Any changes will be posted on this page.",
  },
  {
    heading: "6. Contact",
    body: "If you have any questions about our use of cookies, please contact us using the contact information provided on this website.",
  },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <SubNav />

      <main className="pt-32 flex justify-center w-full max-w-[1400px] mx-auto flex-1">
        <section className="flex flex-col items-center px-4 pt-6 pb-16 w-full">
          <div className="w-full max-w-2xl font-sans uppercase tracking-normal text-white">
            <h1 className="mb-2 text-xl font-medium text-center sm:text-2xl">Cookies</h1>
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

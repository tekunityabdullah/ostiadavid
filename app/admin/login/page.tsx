import type { Metadata } from "next";
import Footer from "../../components/Footer";
import AdminLoginForm from "./AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login - Osita David",
  description: "Admin access for Osita David product management",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <AdminLoginForm />
      </main>
      <Footer />
    </div>
  );
}

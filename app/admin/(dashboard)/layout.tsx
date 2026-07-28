import AdminSidebar from "./AdminSidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white md:flex">
      <AdminSidebar />
      <main className="flex-1 md:ml-60">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-8 md:px-10 md:py-12">
          {children}
        </div>
      </main>
    </div>
  );
}

import AdminNavBar from "@/components/ui/AdminNavBar";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full max-w-400 min-h-dvh flex justify-center">
        {children}
      </div>
      <AdminNavBar></AdminNavBar>
    </div>
  );
}

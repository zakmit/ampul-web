import AdminNavBar from "@/components/admin/AdminNavBar";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Admin - AMPUL",
  robots: {
    index: false,
    follow: false,
  },
};

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

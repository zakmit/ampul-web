export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-400">
        {children}
      </div>
    </div>
  );
}

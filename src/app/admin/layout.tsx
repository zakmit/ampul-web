export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-400 flex justify-center">
        {children}
      </div>
    </div>
  );
}

import Sidebar from "../_components/sidebar";

export default function CustomerPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      <Sidebar />

      <main className="min-h-screen pt-16 md:ml-64 md:pt-0">
        {children}
      </main>
    </div>
  );
}
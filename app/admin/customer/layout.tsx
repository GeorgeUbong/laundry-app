import SidebarAdmin from "../_admincomponents/sidebar";
import Sidebar from "../_admincomponents/sidebar";

export default function Customer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      <SidebarAdmin />

      <main className="min-h-screen pt-16 md:ml-64 md:pt-0">
        {children}
      </main>
    </div>
  );
}
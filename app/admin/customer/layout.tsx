import SidebarAdmin from "../_admincomponents/sidebar";
import { AuthGuard } from "../../_components/AuthGuard";

export default function Customer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      <AuthGuard appType="admin" loginPath="/admin">
        <SidebarAdmin />

        <main className="min-h-screen pt-16 md:ml-64 md:pt-0">
          {children}
        </main>
      </AuthGuard>
    </div>
  );
}
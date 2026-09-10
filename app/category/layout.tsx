import Sidebar from "../_components/sidebar";
import { AuthGuard } from "../_components/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      <AuthGuard appType="user" loginPath="/">
        <Sidebar />

        <main className="min-h-screen pt-16 md:ml-64 md:pt-0">
          {children}
        </main>
      </AuthGuard>
    </div>
  );
}
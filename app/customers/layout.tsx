import EmployeeSidebar from "../_components/sidebar";

export default function Customer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">

      <EmployeeSidebar />

      <div className="lg:ml-72">

        {/* Space for mobile header */}
        <div className="pt-16 lg:pt-0">
          {children}
        </div>

      </div>

    </div>
  );
}
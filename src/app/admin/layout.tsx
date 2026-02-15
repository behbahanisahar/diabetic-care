import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import AdminNav from "./AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAdminAuthenticated();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/80 to-white">
      {authenticated && <AdminNav />}
      {children}
    </div>
  );
}

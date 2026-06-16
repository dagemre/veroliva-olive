import AdminShell from "@/components/admin/AdminShell";

// /admin altındaki tüm sayfalar ortak iskeleti (sol menü + is_admin koruması) kullanır.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}

import AccountShell from "@/components/account/AccountShell";

// /hesap altındaki tüm sayfalar ortak iskeleti (sol menü + oturum koruması) kullanır.
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}

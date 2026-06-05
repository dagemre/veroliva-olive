import Image from "next/image";

/* Auth sayfaları ortak çatısı: solda form, sağda görsel panel.
   Tasarım: krem kart, ince çizgi kenarlık; sağ panel yalnızca lg+ görünür. */
export default function AuthShell({
  children,
  aside,
}: {
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8">
      <div className="grid overflow-hidden border border-line bg-cream-light shadow-sm lg:grid-cols-[5fr_6fr]">
        <div className="flex items-start justify-center px-6 py-12 sm:px-10 lg:items-center lg:py-16">
          <div className="w-full max-w-sm">
            {/* Zeytin dalı süslemesi */}
            <Image
              src="/icons/zeytindali.svg"
              alt=""
              width={72}
              height={36}
              className="mb-6 h-9 w-auto"
              aria-hidden="true"
            />
            {children}
          </div>
        </div>
        <div className="relative hidden lg:block">{aside}</div>
      </div>
    </section>
  );
}

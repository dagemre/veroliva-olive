import { preload } from "react-dom";

// İç sayfalar için hero bandı — homepage Hero ile aynı degrade deseni,
// daha alçak ve CTA'sız. Header şeffaf olduğu için -mt-20 ile arkasına uzanır.
export default function PageHero({
  title,
  text,
  image,
}: {
  title: string;
  text: string;
  image: string;
}) {
  // LCP: hero arka plan görselini erkenden indir.
  preload(image, { as: "image", fetchPriority: "high" });

  return (
    <section
      className="relative -mt-20 flex min-h-[280px] items-center bg-olive bg-cover bg-center lg:min-h-[320px]"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(244,239,224,0.95) 0%, rgba(238,229,202,0.7) 90px, rgba(238,229,202,0) 200px), linear-gradient(to right, rgba(35,42,20,0.55) 0%, rgba(35,42,20,0.25) 55%, rgba(35,42,20,0.05) 100%), url('${image}')`,
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-28 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <h1 className="font-display text-3xl leading-tight text-cream sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-cream/85">
            {text}
          </p>
        </div>
      </div>
    </section>
  );
}

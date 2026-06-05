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
      className="relative -mt-20 flex min-h-[460px] items-center bg-olive bg-cover bg-center lg:min-h-[540px]"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(244,239,224,0.95) 0%, rgba(238,229,202,0.75) 110px, rgba(238,229,202,0) 300px), linear-gradient(to right, rgba(35,42,20,0.55) 0%, rgba(35,42,20,0.25) 55%, rgba(35,42,20,0.05) 100%), url('${image}')`,
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-36 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <h1 className="font-display text-4xl leading-tight text-cream sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/85 sm:text-base">
            {text}
          </p>
        </div>
      </div>
    </section>
  );
}

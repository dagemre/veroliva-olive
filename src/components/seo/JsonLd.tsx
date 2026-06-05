// JSON-LD structured data'yı sayfaya gömer (server component).
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON içindeki "<" karakterleri script enjeksiyonuna karşı kaçırılır.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

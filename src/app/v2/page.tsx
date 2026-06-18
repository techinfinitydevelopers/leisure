import NavV2 from "@/components/v2/NavV2";
import FooterV2 from "@/components/v2/FooterV2";
import ScrollExplode from "@/components/landing/v2/ScrollExplode";
import ScrollProductSections from "@/components/v2/ScrollProductSections";
import ProductGridV2 from "@/components/v2/ProductGridV2";
import ProductShowcase from "@/components/sections/ProductShowcase";

export const metadata = {
  title: "Leisure — Sound Your Wild (Gold Noir)",
  description: "Premium wireless audio, engineered for powerful sound.",
};

export default function HomeV2() {
  return (
    /* Fixed overlay covers root Nav/Footer — this page has its own shell */
    <div
      id="v2-scroll"
      className="fixed inset-0 z-[200] overflow-y-auto"
      style={{ backgroundColor: "#070707" }}
    >
      <NavV2 />
      <main>
        {/* Scrollytelling canvas — 6 gallery images with cinematic text */}
        <ScrollExplode />

        <div id="v2-products">
          <ScrollProductSections />

        {/* Stats strip */}
        <div
          className="py-10"
          style={{ borderTop: "1px solid rgba(237,196,132,0.08)", borderBottom: "1px solid rgba(237,196,132,0.08)" }}
        >
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-5 sm:px-8 lg:grid-cols-4">
            {[
              { value: "50K+", label: "Happy Listeners" },
              { value: "6",    label: "Flagship Models" },
              { value: "20h",  label: "Battery Life" },
              { value: "4.9★", label: "Avg Rating" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 text-center">
                <span
                  className="font-display text-3xl font-black sm:text-4xl"
                  style={{
                    background: "linear-gradient(135deg,#edc484,#c8922a)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {s.value}
                </span>
                <span className="text-xs uppercase tracking-[0.18em] text-white/40">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <ProductGridV2 />

        <div style={{ borderTop: "1px solid rgba(237,196,132,0.08)" }}>
          <ProductShowcase />
        </div>
        </div>{/* /v2-products */}
      </main>
      <FooterV2 />
    </div>
  );
}

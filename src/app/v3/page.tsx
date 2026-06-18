import NavV3 from "@/components/v3/NavV3";
import FooterV3 from "@/components/v3/FooterV3";
import HeroV3 from "@/components/v3/HeroV3";
import ProductGridV3 from "@/components/v3/ProductGridV3";
import ProductShowcase from "@/components/sections/ProductShowcase";

export const metadata = {
  title: "Leisure — Sound Your Wild (Ivory Luxe)",
  description: "Premium wireless audio, engineered for powerful sound.",
};

export default function HomeV3() {
  return (
    <div
      id="v3-scroll"
      className="fixed inset-0 z-[200] overflow-y-auto"
      style={{ backgroundColor: "#f7f2ea" }}
    >
      <NavV3 />
      <main>
        <HeroV3 />

        {/* Stats strip */}
        <div style={{ borderTop: "1px solid rgba(66,2,6,0.08)", borderBottom: "1px solid rgba(66,2,6,0.08)", background: "rgba(255,255,255,0.5)" }}>
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-5 py-10 sm:px-8 lg:grid-cols-4">
            {[
              { value: "50K+", label: "Happy Listeners" },
              { value: "6",    label: "Flagship Models" },
              { value: "20h",  label: "Battery Life" },
              { value: "4.9★", label: "Avg Rating" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 text-center">
                <span className="font-display text-3xl font-black text-[#000000] sm:text-4xl">{s.value}</span>
                <span className="text-xs uppercase tracking-[0.18em] text-[#000000]/35">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <ProductGridV3 />

        <div style={{ borderTop: "1px solid rgba(66,2,6,0.08)" }}>
          <ProductShowcase />
        </div>
      </main>
      <FooterV3 />
    </div>
  );
}

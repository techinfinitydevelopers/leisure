// Rich R3F scroll-experience content for product pages, ported from the DRIFT
// prototype (src/data/products/*.js). This drives the roaming 3D plane + the
// scroll-choreographed marketing sections. Pricing/specs also live here so the
// experience renders standalone; the DB (products.ts) remains the commerce
// source of truth for cart/checkout.
import type { TrackStop } from "./keyframes";

export type ExpColor = {
  id: string;
  name: string;
  hex: string;
  images: string[]; // transparent PNG cutouts for the floating plane [front, back/tilt]
  /** Shopify variant GID — enables headless checkout for this variant. */
  variantId?: string;
};

export type SpecPair = { k: string; v: string };
export type FeatureIcon = { icon: string; label: string; sub: string };
export type DeepDive = { title: string; copy: string };
export type BoxItem = { name: string; note: string };
export type FaqItem = { q: string; a: string };
export type Highlight = { value: string; label: string };

export type ProductExperience = {
  slug: string;
  name: string;
  tagline: string;
  price: number;
  mrp: number;
  discountPct: number;
  currency: string;
  blurb: string;
  /** Optional rich-HTML variant of the blurb (from Shopify Description). */
  blurbHtml?: string;
  /** Optional marquee phrase (e.g. "SOUND THAT TRAVELS — RAIN OR SHINE"). */
  lifestyleLoop?: string;
  colors: ExpColor[];
  texture?: string;
  /** Optional 3D model (glTF/GLB). When set, the roaming 3D model replaces the
   *  2D image plane and is driven by the same scroll track. */
  model?: string;
  /** No GLB yet for this product — skip the roaming/explode 2D-plane
   *  animation entirely (still shows the static hero image + swatches).
   *  Remove this flag once `model` is set. */
  skipPlaneAnimation?: boolean;
  /** Optional multiplier applied on top of the auto-fit scale, for models that
   *  should render larger/smaller than the standard normalized height. */
  modelScale?: number;
  /** Override the shared base heading (radians) so THIS model's branded
   *  front faces the camera at rest. Only needed when a GLB's authored
   *  front axis differs from the rest (e.g. a re-exported/replacement model). */
  modelBaseRy?: number;
  perspective?: {
    heroVariant?: "split";
    specLayout?: "explorer" | "rail" | "default";
    planeH?: number;
  };
  spinStage?: { eyebrow: string; caption: string };
  explodeStage?: { eyebrow: string; caption: string };
  featureFocus?: { eyebrow: string; caption: string };
  /** How the roaming model parks while the Overview section is in view:
   *  x = viewport fraction (negative = left), ry = heading (rad), scale = size
   *  multiplier (<1 smaller). Omit to just follow the roam track. */
  overviewModel?: { x?: number; ry?: number; scale?: number };
  /** Guided feature tour: on scroll the model eases through each stop's
   *  orientation (rx/ry radians) and X position (viewport fraction, 0 = centre,
   *  negative = left) while that stop's title/copy fades in. */
  featureStops?: {
    title: string;
    copy: string;
    rx: number;
    ry: number;
    x?: number;
  }[];
  highlights?: Highlight[];
  parallax?: {
    image: string;
    eyebrow: string;
    caption: string;
    slideAside?: boolean;
  };
  slideAsideOnFeatures?: boolean;
  /** Render the Feature Grid ABOVE the 3D layer with a frosted backdrop, so the
   *  roaming model sits softly in the background behind the grid. */
  featuresBackground?: boolean;
  /** How the model parks while the Feature Grid is in view (x = viewport
   *  fraction, ry = heading rad, scale = size multiplier). */
  featuresModel?: { x?: number; ry?: number; scale?: number };
  /** How the model parks while the Specifications section is pinned. */
  specsModel?: { x?: number; ry?: number; scale?: number };
  /** Deep-dive roam: model sits on the empty side of each alternating row
   *  (x = offset magnitude, applied left/right per row). */
  deepDiveModel?: { x?: number; ry?: number; scale?: number };
  /** Render Technical Details as an Apple-style split-scroll: sticky spec list
   *  on the left, the model showing a different angle per spec on the right. */
  technicalSplit?: boolean;
  /** Pinned finale after the FAQ: the model lands centred in an empty band
   *  before the footer. */
  landingStage?: { eyebrow: string; caption: string };
  track: TrackStop[];
  overview: string;
  features?: FeatureIcon[];
  deepDives?: DeepDive[];
  specs: SpecPair[];
  technical: SpecPair[];
  box: BoxItem[];
  faq?: FaqItem[];
};

const drift: ProductExperience = {
  slug: "drift",
  name: "DRIFT",
  tagline: "Portable Bluetooth Speaker",
  price: 3190,
  mrp: 5999,
  discountPct: 47,
  currency: "₹",
  blurb:
    "Room-filling sound that goes wherever you do. Signature analog-tuned drivers, all-day battery, and a build that takes the journey with you.",
  colors: [
    { id: "black", name: "Black", hex: "#000000", images: ["/products/drift/black-drift-front.png", "/products/drift/tiltedblack-drift-front.png"] },
    { id: "grey", name: "Grey", hex: "#b8b8b8", images: ["/products/drift/grey-drift-front.png", "/products/drift/tiltedgrey-drift-front.png"] },
  ],
  texture: "/products/drift/front.png",
  model: "/products/drift/drift-model.glb",
  modelBaseRy: 0,
  spinStage: { eyebrow: "Every angle", caption: "See it from all sides." },
  featureFocus: { eyebrow: "Designed around you", caption: "A closer look." },
  overviewModel: { x: 0.32, ry: -0.6, scale: 0.62 }, // right, closer to the copy, turned right, smaller
  featuresBackground: true, // model sits behind the feature grid (frosted backdrop)
  featuresModel: { x: -0.32, ry: 0, scale: 0.5 }, // left, front, smaller (background)
  specsModel: { x: 0.04, ry: 0, scale: 0.4 }, // parked in the empty gap between the spec labels and values (list scrolls past underneath, so it must clear BOTH columns, not just the right one)
  deepDiveModel: { x: 0.34, ry: 1.45, scale: 0.5 }, // roams to the empty side; ~90° so it shows its side profile
  technicalSplit: true, // sticky spec list left, model angles per spec on the right
  landingStage: { eyebrow: "Made for the move", caption: "That's DRIFT." },
  // Guided tour — model rotates to each angle as its text fades in.
  // rx/ry in radians; tune against a screenshot.
  featureStops: [
    { title: "Signature Sound", copy: "Analog-tuned drivers fill the room — clean highs, warm lows.", rx: 0, ry: 0, x: -0.3 }, // front grille, left
    { title: "DOMINATOR Controls", copy: "Bass, mid, treble and volume — hand-tuned dials, right on top where you reach.", rx: 1.1, ry: 0, x: 0 }, // top view
    { title: "Grab & Go", copy: "A leather carry strap and a rugged build made to travel with you.", rx: -0.3, ry: -0.7, x: 0.15 }, // 3/4 angle
  ],
  perspective: { heroVariant: "split" },
  // Horizontal roam — clean left <-> right sweeps, minimal vertical drift.
  track: [
    { at: 0.0, x: -0.28, y: 0.0, rz: 0.0, ry: 0.0, s: 1.0, o: 1 },
    { at: 0.08, x: -0.28, y: 0.0, rz: 0.0, ry: 0.0, s: 1.0, o: 1 }, // parked left (hero)
    { at: 0.3, x: 0.3, y: 0.0, rz: 0.0, ry: -0.3, s: 1.05, o: 1 }, // sweep right
    { at: 0.5, x: -0.3, y: 0.0, rz: 0.0, ry: 0.35, s: 1.05, o: 1 }, // sweep left
    { at: 0.7, x: 0.3, y: 0.0, rz: 0.0, ry: -0.3, s: 1.05, o: 1 }, // sweep right
    { at: 0.88, x: -0.28, y: 0.0, rz: 0.0, ry: 0.25, s: 1.0, o: 1 }, // drift left
    { at: 1.0, x: 0.0, y: 0.0, rz: 0.0, ry: 0.0, s: 1.0, o: 1 }, // settle centre (LandingStage holds the finale)
  ],
  overview:
    "Meet the DRIFT, your ultimate everyday audio companion designed for life on the move. Compact, stylish, and incredibly lightweight, its water-resistant build seamlessly blends into your active daily routine. Experience crystal-clear sound that travels wherever you go, ensuring your favorite tracks are always by your side, rain or shine.",
  features: [
    { icon: "drop", label: "Water-Resistant", sub: "IPX build" },
    { icon: "feather", label: "Ultra-Lightweight", sub: "336 g" },
    { icon: "bluetooth", label: "Bluetooth 5.3", sub: "Stable pairing" },
    { icon: "battery", label: "8+ Hours Playtime", sub: "All day" },
    { icon: "usb", label: "USB Type-C", sub: "Fast charge" },
    { icon: "speaker", label: "50 MM Driver", sub: "Full-range" },
  ],
  specs: [
    { k: "Battery Capacity", v: "2500 mAh" },
    { k: "Output Power", v: "10W" },
    { k: "Connectivity", v: "Bluetooth 5.3" },
    { k: "Playtime", v: "> 8 hours" },
    { k: "Charging Time", v: "3 hours" },
    { k: "Charging Input", v: "Type-C DC 5V" },
  ],
  deepDives: [
    { title: "Built to get wet", copy: "A water-resistant build that shrugs off splashes, spray and sudden downpours. Take it poolside, to the beach, or out on the trail — rain or shine, the music keeps playing." },
    { title: "Crystal-clear sound", copy: "An analog-tuned 50mm full-range driver delivers room-filling clarity with punchy lows and crisp highs, so every track sounds the way it was meant to." },
    { title: "All-day battery", copy: "8+ hours of playtime on a single charge, and a 3-hour Type-C fast charge gets you back to full. Less time tethered, more time listening." },
    { title: "Carry it anywhere", copy: "At just 336 g and 128×49×93 mm, the DRIFT slips into any bag, pocket or palm. Built light so it goes everywhere you do." },
  ],
  technical: [
    { k: "Frequency Response", v: "45Hz – 20KHz" },
    { k: "Input Sensitivity", v: "450mV" },
    { k: "Driver Size", v: "50 MM" },
    { k: "Product Weight", v: "336 g" },
    { k: "Product Size", v: "128×49×93 mm" },
  ],
  box: [
    { name: "DRIFT Speaker", note: "The main event." },
    { name: "Dust Bag", note: "Soft-touch travel pouch." },
    { name: "Type-C Cable", note: "Fast charge, anywhere." },
    { name: "Warranty Card", note: "12-month coverage." },
  ],
  faq: [
    { q: "How water-resistant is the DRIFT?", a: "The DRIFT features a water-resistant IPX build that protects against splashes, rain and spray. Wipe it down after exposure and avoid full submersion." },
    { q: "How long does the battery last?", a: "A full charge delivers 8+ hours of playtime from the 2500 mAh battery, depending on volume and content." },
    { q: "How do I charge it and how long does it take?", a: "Charge over the included USB Type-C cable (DC 5V). A full charge takes roughly 3 hours." },
    { q: "Is there a warranty?", a: "Yes — the DRIFT comes with 12-month coverage. Keep the included warranty card for your records." },
  ],
};

const edge: ProductExperience = {
  slug: "edge",
  name: "EDGE",
  tagline: "Sleek look. Unstoppable sound.",
  price: 8900,
  mrp: 14999,
  discountPct: 41,
  currency: "₹",
  blurb:
    "Experience the perfect blend of elegance and acoustic brilliance with the Leisure Edge.",
  colors: [
    { id: "black", name: "Black", hex: "#000000", images: ["/products/edge/black/edge-black-front.png", "/products/edge/black/edge-black-back.png"] },
    { id: "white", name: "White", hex: "#e9e6df", images: ["/products/edge/white/white-edge-front.png", "/products/edge/white/white-edge-back.png"] },
    { id: "orange", name: "Orange", hex: "#e8631a", images: ["/products/edge/orange/edge-orange-front.png", "/products/edge/orange/edge-orange-back.png"] },
  ],
  perspective: { heroVariant: "split", specLayout: "explorer" },
  // Bespoke cinema-mode experience. Uses the shared GLB roam infrastructure
  // but drives it through EDGE-specific choreography (see /edge/EdgeExperience).
  model: "/products/edge/edge-model.glb",
  modelScale: 1.35,
  // Explicit, independent value (was silently falling back to the shared
  // BASE_RY default before) — verified this facing is correct for EDGE's
  // GLB via screenshots, now locked in so it can't drift if the shared
  // default is ever retuned for another product.
  modelBaseRy: -Math.PI / 2 + 0.42,
  landingStage: { eyebrow: "Cinematic by design", caption: "That's EDGE." },
  featureStops: [
    { title: "Twin Drivers", copy: "Two 15W main drivers keep vocals and mids crystal-clear.", rx: 0.05, ry: -0.35, x: -0.3 },
    { title: "Twin Tweeters", copy: "Twin 10W tweeters add air to every high — cymbals, strings, breath.", rx: 0.15, ry: 0.4, x: 0.3 },
    { title: "5-in-1 Inputs", copy: "Bluetooth, AUX, USB, TWS, Optical — every source connects.", rx: -0.6, ry: 0, x: 0 },
  ],
  spinStage: { eyebrow: "Every angle", caption: "See it from all sides." },
  highlights: [
    { value: "50W", label: "Total Output" },
    { value: "10000 mAh", label: "Battery" },
    { value: "16h+", label: "Playtime" },
    { value: "5-in-1", label: "Inputs" },
  ],
  parallax: {
    image: "/products/edge/orange/edge-orange-front.png",
    eyebrow: "Cinematic by design",
    caption: "Unstoppable sound, anywhere.",
  },
  track: [
    { at: 0.0, x: -0.26, y: 0.0, rz: 0.0, ry: 0.0, s: 1.0, o: 1 },
    { at: 0.1, x: -0.26, y: 0.0, rz: 0.0, ry: 0.0, s: 1.0, o: 1 },
    { at: 0.3, x: -0.12, y: 0.04, rz: -0.05, ry: 0.5, s: 0.8, o: 1 },
    { at: 0.55, x: 0.3, y: 0.0, rz: 0.06, ry: -0.4, s: 0.95, o: 1 },
    { at: 0.75, x: 0.0, y: 0.0, rz: 0.0, ry: 0.2, s: 1.3, o: 1 },
    { at: 0.9, x: -0.3, y: 0.03, rz: -0.06, ry: 0.55, s: 0.95, o: 1 },
    { at: 1.0, x: 0.0, y: 0.0, rz: 0.0, ry: 0.0, s: 1.1, o: 1 },
  ],
  overview:
    "Experience the perfect blend of elegance and acoustic brilliance with the Leisure Edge. Designed to complement modern living spaces, it delivers immersive, room-filling sound with deep bass and crystal-clear detail. Whether you're gaming, watching movies, or streaming music, Edge transforms everyday entertainment into a cinematic experience.",
  specs: [
    { k: "Battery Capacity", v: "10000 mAh" },
    { k: "Output Power", v: "15W×2 + 10W×2" },
    { k: "Connectivity", v: "BT / AUX / USB / TWS / Optical" },
    { k: "Playtime", v: "> 16 hours" },
    { k: "Charging Time", v: "3:30 hours" },
    { k: "Charging Input", v: "DC 20V 2A 40W" },
  ],
  technical: [
    { k: "Frequency Response", v: "20Hz – 20KHz" },
    { k: "Input Sensitivity", v: "600mV" },
    { k: "Driver Size", v: "2× treble + 2×58 mm bass" },
    { k: "Product Weight", v: "2.17 Kg" },
    { k: "Product Size", v: "500×94×93 mm" },
  ],
  box: [
    { name: "Speaker", note: "The main event." },
    { name: "AUX Cable", note: "Wired-in, anytime." },
    { name: "Optical Audio Cable", note: "Lossless digital input." },
    { name: "Warranty Card", note: "Coverage for peace of mind." },
    { name: "Power Adaptor", note: "40W fast charge." },
  ],
};

const drift2: ProductExperience = {
  slug: "drift2",
  name: "DRIFT",
  tagline: "Portable Bluetooth speaker with 8+ hours of go-anywhere playtime",
  price: 3190,
  mrp: 5999,
  discountPct: 47,
  currency: "₹",
  blurb: "Room-filling sound that travels light — rain or shine.",
  colors: [
    { id: "black", name: "Black", hex: "#000000", images: ["/products/drift/black-drift-front.png", "/products/drift/tiltedblack-drift-front.png"] },
    { id: "grey", name: "Grey", hex: "#b8b8b8", images: ["/products/drift/grey-drift-front.png", "/products/drift/tiltedgrey-drift-front.png"] },
  ],
  texture: "/products/drift/front.png",
  perspective: { heroVariant: "split", specLayout: "explorer" },
  spinStage: { eyebrow: "Every angle", caption: "See it from all sides." },
  highlights: [
    { value: "10W", label: "Output Power" },
    { value: "2500 mAh", label: "Battery" },
    { value: "8h+", label: "Playtime" },
    { value: "IPX", label: "Water-Resistant" },
  ],
  parallax: {
    image: "/products/drift/tiltedblack-drift-front.png",
    eyebrow: "Made for the move",
    caption: "Sound that travels light.",
    slideAside: true,
  },
  slideAsideOnFeatures: true,
  track: [
    { at: 0.0, x: -0.26, y: 0.0, rz: 0.0, ry: 0.0, s: 1.0, o: 1 },
    { at: 0.08, x: -0.26, y: 0.0, rz: 0.0, ry: 0.0, s: 1.0, o: 1 },
    { at: 0.18, x: 0.05, y: 0.05, rz: 0.05, ry: 0.25, s: 1.2, o: 1 },
    { at: 0.35, x: -0.3, y: 0.02, rz: -0.1, ry: 0.5, s: 1.05, o: 1 },
    { at: 0.55, x: 0.3, y: -0.04, rz: 0.1, ry: -0.45, s: 1.1, o: 1 },
    { at: 0.72, x: 0.0, y: 0.0, rz: 0.0, ry: 0.2, s: 1.25, o: 1 },
    { at: 0.88, x: -0.28, y: 0.03, rz: -0.06, ry: 0.3, s: 1.0, o: 1 },
    { at: 1.0, x: 0.28, y: 0.0, rz: 0.0, ry: 0.0, s: 1.0, o: 1 },
  ],
  overview:
    "Meet the DRIFT, your ultimate everyday audio companion designed for life on the move. Compact, stylish, and incredibly lightweight, its water-resistant build seamlessly blends into your active daily routine. Experience crystal-clear sound that travels wherever you go, ensuring your favorite tracks are always by your side, rain or shine.",
  features: [
    { icon: "drop", label: "Water-Resistant", sub: "IPX build" },
    { icon: "feather", label: "Ultra-Lightweight", sub: "336 g" },
    { icon: "bluetooth", label: "Bluetooth 5.3", sub: "Stable pairing" },
    { icon: "battery", label: "8+ Hours Playtime", sub: "All day" },
    { icon: "usb", label: "USB Type-C", sub: "Fast charge" },
    { icon: "speaker", label: "50 MM Driver", sub: "Full-range" },
  ],
  deepDives: [
    { title: "8+ hours of playtime", copy: "A speaker built for the whole day, not just the moment. Start your morning playlist in the kitchen and carry the same charge to the evening on the balcony. With 8+ hours on a single charge, the music keeps going long after you've moved on to the next room." },
    { title: "Crystal-clear sound", copy: "An analog-tuned 50 mm full-range driver fills the room with sound the way it was meant to be heard — punchy lows, clean mids, and crisp highs. 10W of output keeps every track detailed, whether it's a quiet acoustic set or your loudest playlist." },
    { title: "Water-resistant build", copy: "DRIFT's water-resistant IPX design is ready for real life. A splash by the pool, a bit of spray at the beach, or a sudden downpour on the trail — it shrugs it all off and keeps playing." },
    { title: "Built to carry", copy: "At just 336 g and 128×49×93 mm, DRIFT slips into any bag, pocket, or palm. Light enough to forget it's there, tough enough to take the journey with you." },
    { title: "Dynamic loudness", copy: "Turn it all the way up without losing the detail. DRIFT is tuned so the bass, mids, and treble stay balanced at every volume — quiet enough for late nights, loud enough to fill the room, and clean the whole way through." },
    { title: "Charging bank", copy: "Out of power on your phone? DRIFT doubles as a backup. Plug in over USB and let the speaker share its charge — so the one thing you always carry keeps everything else alive too." },
    { title: "Bluetooth 5.3", copy: "Pair once and stay connected. Bluetooth 5.3 gives you a stable, low-drop link with the range to move around the room — no cutting out, no fuss." },
    { title: "Fast Type-C charging", copy: "A quick top-up over USB Type-C gets you back to full in about 3 hours. Less time on the cable, more time listening — plug in, and let DRIFT do the rest." },
    { title: "M-button presets", copy: "One button, your sound. Tap the M-button to jump straight to your favourite EQ preset — from deep bass for a party to balanced clarity for podcasts — without ever reaching for your phone." },
  ],
  specs: [
    { k: "Battery Capacity", v: "2500 mAh" },
    { k: "Output Power", v: "10W" },
    { k: "Connectivity", v: "Bluetooth 5.3" },
    { k: "Playtime", v: "> 8 hours" },
    { k: "Charging Time", v: "3 hours" },
    { k: "Charging Input", v: "Type-C DC 5V" },
  ],
  technical: [
    { k: "Frequency Response", v: "45Hz – 20KHz" },
    { k: "Input Sensitivity", v: "450mV" },
    { k: "Driver Size", v: "50 MM" },
    { k: "Product Weight", v: "336 g" },
    { k: "Product Size", v: "128×49×93 mm" },
  ],
  box: [
    { name: "DRIFT Speaker", note: "The main event." },
    { name: "Type-C Cable", note: "Fast charge, anywhere." },
    { name: "Dust Bag", note: "Soft-touch travel pouch." },
    { name: "Warranty Card", note: "12-month coverage." },
  ],
  faq: [
    { q: "How water-resistant is the DRIFT?", a: "The DRIFT features a water-resistant IPX build that protects against splashes, rain and spray. Wipe it down after exposure and avoid full submersion." },
    { q: "How long does the battery last?", a: "A full charge delivers 8+ hours of playtime from the 2500 mAh battery, depending on volume and content." },
    { q: "How do I charge it and how long does it take?", a: "Charge over the included USB Type-C cable (DC 5V). A full charge takes roughly 3 hours." },
    { q: "Is there a warranty?", a: "Yes — the DRIFT comes with 12-month coverage. Keep the included warranty card for your records." },
  ],
};

// Dominator reuses DRIFT's scroll choreography while carrying its own copy +
// GLB. Marketing content is expected to come from Shopify metafields; the
// values below are just static fallbacks used when a field isn't populated.
const dominator: ProductExperience = {
  slug: "dominator",
  name: "DOMINATOR",
  tagline: "Built to Dominate.",
  price: 25900,
  mrp: 32999,
  discountPct: 22,
  currency: "₹",
  blurb:
    "Massive, bone-shaking sound engineered for the ultimate party. Dual wireless mics, flagship power, built to dominate any room.",
  colors: [
    { id: "black", name: "Black", hex: "#000000", images: ["/products/dominator/black/1.jpg", "/products/dominator/black/2.jpg", "/products/dominator/black/3.jpg"] },
    { id: "grey", name: "Grey", hex: "#b8b8b8", images: ["/products/dominator/light-grey/1.jpg", "/products/dominator/light-grey/2.jpg", "/products/dominator/light-grey/3.jpg"] },
  ],
  model: "/products/dominator/dominator-model.glb",
  // DOMINATOR is a big, deep box (338x180x240mm — much deeper front-to-back
  // than DRIFT's 128x49x93mm), so it needs its own facing + scale-fit tuning
  // rather than reusing DRIFT's. Independent literal values below (not
  // references) so retuning one product never silently moves the other.
  // NOTE: re-tuned 2026-07-24 after swapping in a new GLB — its authored front
  // axis differs from the previous model (was showing the left side panel at
  // ry:0 instead of the front grille).
  modelBaseRy: 0,
  modelScale: 1,
  spinStage: { eyebrow: "Every angle", caption: "See it from all sides." },
  featureFocus: { eyebrow: "Designed around you", caption: "A closer look." },
  overviewModel: { x: 0.32, ry: -0.6, scale: 0.5 }, // right, closer to the copy, turned right, smaller
  featuresBackground: true, // model sits behind the feature grid (frosted backdrop)
  featuresModel: { x: -0.32, ry: 0, scale: 0.4 }, // left, front, smaller (background) — sized down for the deeper box
  specsModel: { x: 0.0, ry: 0, scale: 0.32 }, // parked in the empty gap between the spec labels and values (list scrolls past underneath, so it must clear BOTH columns, not just the right one)
  deepDiveModel: { x: 0.34, ry: 1.45, scale: 0.4 }, // roams to the empty side; ~90° so it shows its side profile
  technicalSplit: true, // sticky spec list left, model angles per spec on the right
  landingStage: { eyebrow: "Turn it up", caption: "That's DOMINATOR." },
  featureStops: [
    { title: "Signature Sound", copy: "Analog-tuned drivers fill the room — clean highs, warm lows.", rx: 0, ry: 0, x: -0.3 },
    { title: "DOMINATOR Controls", copy: "Bass, mid, treble and volume — hand-tuned dials, right on top where you reach.", rx: 1.1, ry: 0, x: 0 },
    { title: "Grab & Go", copy: "A leather carry strap and a rugged build made to travel with you.", rx: -0.3, ry: -0.7, x: 0.15 },
  ],
  perspective: { heroVariant: "split" },
  track: [
    { at: 0.0, x: -0.28, y: 0.0, rz: 0.0, ry: 0.0, s: 1.0, o: 1 },
    { at: 0.08, x: -0.28, y: 0.0, rz: 0.0, ry: 0.0, s: 1.0, o: 1 }, // parked left (hero)
    { at: 0.3, x: 0.3, y: 0.0, rz: 0.0, ry: -0.3, s: 1.05, o: 1 }, // sweep right
    { at: 0.5, x: -0.3, y: 0.0, rz: 0.0, ry: 0.35, s: 1.05, o: 1 }, // sweep left
    { at: 0.7, x: 0.3, y: 0.0, rz: 0.0, ry: -0.3, s: 1.05, o: 1 }, // sweep right
    { at: 0.88, x: -0.28, y: 0.0, rz: 0.0, ry: 0.25, s: 1.0, o: 1 }, // drift left
    { at: 1.0, x: 0.0, y: 0.0, rz: 0.0, ry: 0.0, s: 1.0, o: 1 }, // settle centre (LandingStage holds the finale)
  ],
  overview:
    "Command the ultimate party with the Leisure Dominator, our flagship powerhouse engineered for massive, bone-shaking sound. Designed to deliver a true club-level audio experience, it features dual wireless microphones to handle the most epic, all-night performances.",
  features: [
    { icon: "sound", label: "Flagship Power", sub: "100W + 10W×2 + 20W×2" },
    { icon: "battery", label: "20 000 mAh", sub: "All-night ready" },
    { icon: "bluetooth", label: "5-in-1 Inputs", sub: "BT / AUX / USB / MIC / TWS" },
  ],
  specs: [
    { k: "Battery Capacity", v: "20000 mAh" },
    { k: "Output Power", v: "100W + 10W×2 + 20W×2" },
    { k: "Connectivity", v: "BT / AUX / USB / MIC / TWS" },
    { k: "Playtime", v: "9 hours" },
    { k: "Charging Time", v: "3:30 hours" },
    { k: "Charging Input", v: "DC 20V 2A 40W" },
  ],
  deepDives: [
    { title: "Club-level sound", copy: "A 6.5-inch bass driver plus twin tweeters push room-filling audio that stays clean even at party volume." },
    { title: "Dual wireless mics", copy: "Two included wireless microphones turn the Dominator into an instant PA — hosting, karaoke, or the mic drop." },
    { title: "All-night stamina", copy: "20 000 mAh keeps the party going for 9 hours between charges — no cables in sight." },
  ],
  technical: [
    { k: "Frequency Response", v: "45Hz – 20KHz" },
    { k: "Input Sensitivity", v: "600mV" },
    { k: "Driver Size", v: "2× treble + 6.5 inch bass" },
    { k: "Product Weight", v: "4.08 Kg" },
    { k: "Product Size", v: "338×180×240 mm" },
  ],
  box: [
    { name: "DOMINATOR Speaker", note: "The main event." },
    { name: "Wireless Microphone × 2", note: "For dual-mic performance." },
    { name: "AUX Cable", note: "Wired backup." },
    { name: "Power Adaptor", note: "DC 20V 2A." },
    { name: "Warranty Card", note: "12-month coverage." },
  ],
  faq: [
    { q: "How loud does the Dominator go?", a: "With 100W of primary power plus 40W of tweeters/mids, it comfortably fills large rooms and outdoor gatherings without distortion." },
    { q: "Do the wireless mics work out of the box?", a: "Yes — pair them via the MIC input; both mics are ready to use with no separate receiver required." },
    { q: "What's the battery life?", a: "About 9 hours of playtime at moderate volume from the 20 000 mAh battery." },
  ],
};

// CORE/LEGEND/ELEVATE have no GLB yet (public/products/{slug}/ only has 2D
// color photography), so `model` is intentionally left unset — the page falls
// back to the 2D ProductPlane. modelBaseRy/modelScale and the stage-placement
// fields (overviewModel etc.) are still filled in with independent literal
// values per user request, so they're already separate and ready the moment a
// GLB is dropped in — just add `model: "/products/{slug}/{slug}-model.glb"`.
// NOTE: ProductPlane.tsx does not read holdX/holdY/holdS, so overviewModel/
// featuresModel/specsModel/deepDiveModel/featureStops are inert until a GLB
// model is set — harmless placeholders for now. Feature/deep-dive copy below
// is derived from the real specs (products.ts), not fabricated — worth a
// copy review before shipping.
const core: ProductExperience = {
  slug: "core",
  name: "CORE",
  tagline: "Power Meets Precision.",
  price: 9900,
  mrp: 15999,
  discountPct: 38,
  currency: "₹",
  blurb:
    "The Leisure Core is where beautiful home decor and powerful, room-filling acoustics live in perfect harmony. Engineered to deliver a refined balance of strong bass and crystal-clear highs, this elegant centerpiece creates an immersive listening experience.",
  colors: [
    { id: "black", name: "Black", hex: "#1c1c1c", images: ["/products/core/black/1.jpg", "/products/core/black/2.jpg"] },
    { id: "brown", name: "Brown", hex: "#5a3b28", images: ["/products/core/brown/1.jpg", "/products/core/brown/2.jpg"] },
    { id: "white", name: "White", hex: "#f3efe6", images: ["/products/core/white/1.jpg", "/products/core/white/2.jpg"] },
    { id: "green", name: "Green", hex: "#2f4a3a", images: ["/products/core/green/1.jpg", "/products/core/green/2.jpg"] },
  ],
  // No GLB yet — placeholder values, independent per product, ready to use once one is added.
  modelBaseRy: -Math.PI / 2 + 0.42,
  modelScale: 1,
  skipPlaneAnimation: true,
  spinStage: { eyebrow: "Every angle", caption: "See it from all sides." },
  featureFocus: { eyebrow: "Designed around you", caption: "A closer look." },
  overviewModel: { x: 0.32, ry: -0.6, scale: 0.6 },
  featuresBackground: true,
  featuresModel: { x: -0.32, ry: 0, scale: 0.48 },
  specsModel: { x: 0.04, ry: 0, scale: 0.38 },
  deepDiveModel: { x: 0.34, ry: 1.45, scale: 0.46 },
  technicalSplit: true,
  landingStage: { eyebrow: "Power meets precision", caption: "That's CORE." },
  featureStops: [
    { title: "Room-Filling Sound", copy: "40W + dual 10W tweeters deliver deep, room-filling sound.", rx: 0, ry: 0, x: -0.3 },
    { title: "CORE Controls", copy: "Bass, mid, treble and volume — tactile controls right where you need them.", rx: 1.1, ry: 0, x: 0 },
    { title: "Home-Ready Design", copy: "A refined silhouette built to complement any room, wherever you set it down.", rx: -0.3, ry: -0.7, x: 0.15 },
  ],
  perspective: { heroVariant: "split" },
  track: [
    { at: 0.0, x: -0.28, y: 0.0, rz: 0.0, ry: 0.0, s: 1.0, o: 1 },
    { at: 0.08, x: -0.28, y: 0.0, rz: 0.0, ry: 0.0, s: 1.0, o: 1 },
    { at: 0.3, x: 0.3, y: 0.0, rz: 0.0, ry: -0.3, s: 1.05, o: 1 },
    { at: 0.5, x: -0.3, y: 0.0, rz: 0.0, ry: 0.35, s: 1.05, o: 1 },
    { at: 0.7, x: 0.3, y: 0.0, rz: 0.0, ry: -0.3, s: 1.05, o: 1 },
    { at: 0.88, x: -0.28, y: 0.0, rz: 0.0, ry: 0.25, s: 1.0, o: 1 },
    { at: 1.0, x: 0.0, y: 0.0, rz: 0.0, ry: 0.0, s: 1.0, o: 1 },
  ],
  overview:
    "Meet the CORE, where beautiful home decor and powerful, room-filling acoustics live in perfect harmony. Engineered to deliver a refined balance of strong bass and crystal-clear highs, it effortlessly brings premium design and soul-soothing performance together to elevate any space.",
  features: [
    { icon: "sound", label: "40W + 10W×2", sub: "Hybrid drivers" },
    { icon: "battery", label: "10,000 mAh", sub: "10 hours playtime" },
    { icon: "bluetooth", label: "BT / AUX / USB / TWS", sub: "Connect anything" },
    { icon: "bolt", label: "Fast Charge", sub: "3:30 hrs full charge" },
  ],
  specs: [
    { k: "Battery Capacity", v: "10000 mAh" },
    { k: "Output Power", v: "40W + 10W×2" },
    { k: "Connectivity", v: "BT / AUX / USB / TWS" },
    { k: "Playtime", v: "10 hours" },
    { k: "Charging Time", v: "3:30 hours" },
    { k: "Charging Input", v: "DC 20V 2A 40W" },
  ],
  deepDives: [
    { title: "Balanced acoustics", copy: "A 40W main driver plus dual 10W tweeters balance deep bass with crystal-clear highs." },
    { title: "Connect anything", copy: "Bluetooth, AUX, USB and TWS pairing — link two COREs for stereo sound across the room." },
    { title: "Built to last", copy: "10 hours of playtime and a fast 3:30-hour recharge keep the music going." },
  ],
  technical: [
    { k: "Frequency Response", v: "20Hz – 20KHz" },
    { k: "Input Sensitivity", v: "600mV" },
    { k: "Driver Size", v: "2× treble + 4 inch bass" },
    { k: "Product Weight", v: "2.31 Kg" },
    { k: "Product Size", v: "260×152×166 mm" },
  ],
  box: [
    { name: "CORE Speaker", note: "The main event." },
    { name: "AUX Cable", note: "Wired backup." },
    { name: "Warranty Card", note: "12-month coverage." },
    { name: "Power Adaptor", note: "DC 20V 2A." },
  ],
  faq: [
    { q: "How long does the battery last?", a: "About 10 hours of playtime from the 10,000 mAh battery, depending on volume." },
    { q: "Can I connect two CORE speakers together?", a: "Yes — pair two units via TWS for synced stereo sound across the room." },
    { q: "Is there a warranty?", a: "Yes — CORE comes with 12-month coverage. Keep the included warranty card for your records." },
  ],
};

const legend: ProductExperience = {
  slug: "legend",
  name: "LEGEND",
  tagline: "Unleash the Legend.",
  price: 13900,
  mrp: 19999,
  discountPct: 30,
  currency: "₹",
  blurb:
    "Discover the LEGEND, our perfectly balanced masterpiece designed for those who love to perform. Featuring a built-in handle for effortless carrying and an included wireless microphone, you can easily take your epic karaoke nights anywhere.",
  colors: [
    { id: "black", name: "Black", hex: "#1c1c1c", images: ["/products/legend/black/1.jpg", "/products/legend/black/2.jpg"] },
    { id: "brown", name: "Brown", hex: "#5a3b28", images: ["/products/legend/brown/1.jpg", "/products/legend/brown/2.jpg"] },
    { id: "green", name: "Green", hex: "#2f4a3a", images: ["/products/legend/green/1.jpg", "/products/legend/green/2.jpg"] },
    { id: "white", name: "White", hex: "#f3efe6", images: ["/products/legend/white/1.jpg", "/products/legend/white/2.jpg"] },
    { id: "orange", name: "Orange", hex: "#c1502e", images: ["/products/legend/orange/1.jpg", "/products/legend/orange/2.jpg"] },
  ],
  model: "/products/legend/legend-model.glb",
  modelBaseRy: -Math.PI / 2 + 0.42,
  modelScale: 1,
  spinStage: { eyebrow: "Every angle", caption: "See it from all sides." },
  featureFocus: { eyebrow: "Designed around you", caption: "A closer look." },
  overviewModel: { x: 0.32, ry: -0.6, scale: 0.58 },
  featuresBackground: true,
  featuresModel: { x: -0.32, ry: 0, scale: 0.46 },
  specsModel: { x: 0.04, ry: 0, scale: 0.36 },
  deepDiveModel: { x: 0.34, ry: 1.45, scale: 0.44 },
  technicalSplit: true,
  landingStage: { eyebrow: "Take the stage", caption: "That's LEGEND." },
  featureStops: [
    { title: "Signature Sound", copy: "A 30W driver plus dual 10W tweeters fill any room with clean, punchy sound.", rx: 0, ry: 0, x: -0.3 },
    { title: "LEGEND Controls", copy: "Bass, mid, treble and volume dials, plus a mic input, right on top.", rx: 1.1, ry: 0, x: 0 },
    { title: "Grab & Go", copy: "A built-in handle makes it easy to carry your karaoke setup anywhere.", rx: -0.3, ry: -0.7, x: 0.15 },
  ],
  perspective: { heroVariant: "split" },
  track: [
    { at: 0.0, x: -0.28, y: 0.0, rz: 0.0, ry: 0.0, s: 1.0, o: 1 },
    { at: 0.08, x: -0.28, y: 0.0, rz: 0.0, ry: 0.0, s: 1.0, o: 1 },
    { at: 0.3, x: 0.3, y: 0.0, rz: 0.0, ry: -0.3, s: 1.05, o: 1 },
    { at: 0.5, x: -0.3, y: 0.0, rz: 0.0, ry: 0.35, s: 1.05, o: 1 },
    { at: 0.7, x: 0.3, y: 0.0, rz: 0.0, ry: -0.3, s: 1.05, o: 1 },
    { at: 0.88, x: -0.28, y: 0.0, rz: 0.0, ry: 0.25, s: 1.0, o: 1 },
    { at: 1.0, x: 0.0, y: 0.0, rz: 0.0, ry: 0.0, s: 1.0, o: 1 },
  ],
  overview:
    "Discover the LEGEND, our perfectly balanced masterpiece designed for those who love to perform. Featuring a built-in handle for effortless carrying and an included wireless microphone, gather your friends and be the absolute star of your own party.",
  features: [
    { icon: "sound", label: "30W + 10W×2", sub: "Hybrid drivers" },
    { icon: "battery", label: "10,000 mAh", sub: "Up to 9 hours" },
    { icon: "bluetooth", label: "BT/AUX/USB/MIC/TWS", sub: "5-in-1 inputs" },
    { icon: "bolt", label: "Fast Charge", sub: "2 hrs full charge" },
  ],
  specs: [
    { k: "Battery Capacity", v: "10000 mAh" },
    { k: "Output Power", v: "30W + 10W×2" },
    { k: "Connectivity", v: "BT / AUX / USB / MIC / TWS" },
    { k: "Playtime", v: "Up to 9 hours" },
    { k: "Charging Time", v: "2 hours" },
    { k: "Charging Input", v: "DC 20V 2A 40W" },
  ],
  deepDives: [
    { title: "Room-filling sound", copy: "A 30W main driver plus twin tweeters balance punchy bass with clear vocals — built for karaoke nights." },
    { title: "Wireless mic included", copy: "One wireless microphone turns any gathering into a live show — no extra gear needed." },
    { title: "All-night ready", copy: "Up to 9 hours of playtime and a 2-hour fast charge keep the party going." },
  ],
  technical: [
    { k: "Frequency Response", v: "20Hz – 20KHz" },
    { k: "Input Sensitivity", v: "600mV" },
    { k: "Driver Size", v: "2× treble + 4 inch bass" },
    { k: "Product Weight", v: "2.56 Kg" },
    { k: "Product Size", v: "262×150×176 mm" },
  ],
  box: [
    { name: "LEGEND Speaker", note: "The main event." },
    { name: "Wireless Microphone", note: "For instant karaoke." },
    { name: "AUX Cable", note: "Wired backup." },
    { name: "Warranty Card", note: "12-month coverage." },
    { name: "Power Adaptor", note: "DC 20V 2A." },
  ],
  faq: [
    { q: "Does the wireless mic work out of the box?", a: "Yes — pair it via the MIC input; it's ready to use with no separate receiver required." },
    { q: "How long does the battery last?", a: "Up to 9 hours of playtime from the 10,000 mAh battery, depending on volume." },
    { q: "Is there a warranty?", a: "Yes — LEGEND comes with 12-month coverage. Keep the included warranty card for your records." },
  ],
};

const elevate: ProductExperience = {
  slug: "elevate",
  name: "ELEVATE",
  tagline: "Double the Energy.",
  price: 17900,
  mrp: 24999,
  discountPct: 28,
  currency: "₹",
  blurb:
    "Take your entertainment to new heights with the ELEVATE, designed for those who love to host and perform. Delivering powerful, thumping sound with exceptional clarity, it transforms any space into a live concert experience.",
  colors: [
    { id: "black", name: "Black", hex: "#1c1c1c", images: ["/products/elevate/black/1.jpg", "/products/elevate/black/2.jpg"] },
    { id: "brown", name: "Brown", hex: "#5a3b28", images: ["/products/elevate/brown/1.jpg", "/products/elevate/brown/2.jpg"] },
    { id: "orange", name: "Orange", hex: "#c1502e", images: ["/products/elevate/orange/1.jpg", "/products/elevate/orange/2.jpg"] },
  ],
  // No GLB yet — placeholder values, independent per product, ready to use once one is added.
  modelBaseRy: -Math.PI / 2 + 0.42,
  modelScale: 1,
  skipPlaneAnimation: true,
  spinStage: { eyebrow: "Every angle", caption: "See it from all sides." },
  featureFocus: { eyebrow: "Designed around you", caption: "A closer look." },
  overviewModel: { x: 0.32, ry: -0.6, scale: 0.55 },
  featuresBackground: true,
  featuresModel: { x: -0.32, ry: 0, scale: 0.44 },
  specsModel: { x: 0.04, ry: 0, scale: 0.34 },
  deepDiveModel: { x: 0.34, ry: 1.45, scale: 0.42 },
  technicalSplit: true,
  landingStage: { eyebrow: "Raise the energy", caption: "That's ELEVATE." },
  featureStops: [
    { title: "Signature Sound", copy: "A 50W driver plus dual 10W tweeters deliver powerful, thumping sound.", rx: 0, ry: 0, x: -0.3 },
    { title: "ELEVATE Controls", copy: "Bass, mid, treble and volume dials, plus dual mic inputs, right on top.", rx: 1.1, ry: 0, x: 0 },
    { title: "Grab & Go", copy: "A rugged, tour-ready build made to power every performance.", rx: -0.3, ry: -0.7, x: 0.15 },
  ],
  perspective: { heroVariant: "split" },
  track: [
    { at: 0.0, x: -0.28, y: 0.0, rz: 0.0, ry: 0.0, s: 1.0, o: 1 },
    { at: 0.08, x: -0.28, y: 0.0, rz: 0.0, ry: 0.0, s: 1.0, o: 1 },
    { at: 0.3, x: 0.3, y: 0.0, rz: 0.0, ry: -0.3, s: 1.05, o: 1 },
    { at: 0.5, x: -0.3, y: 0.0, rz: 0.0, ry: 0.35, s: 1.05, o: 1 },
    { at: 0.7, x: 0.3, y: 0.0, rz: 0.0, ry: -0.3, s: 1.05, o: 1 },
    { at: 0.88, x: -0.28, y: 0.0, rz: 0.0, ry: 0.25, s: 1.0, o: 1 },
    { at: 1.0, x: 0.0, y: 0.0, rz: 0.0, ry: 0.0, s: 1.0, o: 1 },
  ],
  overview:
    "Take your entertainment to new heights with the ELEVATE, designed for those who love to host and perform. Equipped with dual wireless microphones, it enables seamless duets and dynamic performances, making every gathering more energetic and unforgettable.",
  features: [
    { icon: "sound", label: "50W + 10W×2", sub: "Hybrid drivers" },
    { icon: "battery", label: "10,000 mAh", sub: "8 hours playtime" },
    { icon: "bluetooth", label: "BT/AUX/USB/MIC/TWS", sub: "5-in-1 inputs" },
    { icon: "bolt", label: "100W Peak", sub: "Peak power" },
  ],
  specs: [
    { k: "Battery Capacity", v: "10000 mAh" },
    { k: "Output Power", v: "50W + 10W×2" },
    { k: "Connectivity", v: "BT / AUX / USB / MIC / TWS" },
    { k: "Playtime", v: "8 hours" },
    { k: "Charging Time", v: "2:30 hours" },
    { k: "Peak Power", v: "100 W" },
    { k: "Charging Input", v: "DC 20V 2A 40W" },
  ],
  deepDives: [
    { title: "Concert-level sound", copy: "A 50W main driver plus twin tweeters push powerful, clear sound built to fill any space." },
    { title: "Dual wireless mics", copy: "Two included wireless microphones turn ELEVATE into an instant duet-ready PA." },
    { title: "All-night stamina", copy: "8 hours of playtime and a 2:30-hour fast charge keep every set going." },
  ],
  technical: [
    { k: "Frequency Response", v: "20Hz – 20KHz" },
    { k: "Input Sensitivity", v: "600mV" },
    { k: "Driver Size", v: "2× treble + 5.35 inch bass" },
    { k: "Product Weight", v: "2.72 Kg" },
    { k: "Product Size", v: "213×148×310 mm" },
  ],
  box: [
    { name: "ELEVATE Speaker", note: "The main event." },
    { name: "Wireless Microphone × 2", note: "For duet performances." },
    { name: "AUX Cable", note: "Wired backup." },
    { name: "Warranty Card", note: "12-month coverage." },
    { name: "Power Adaptor", note: "DC 20V 2A." },
  ],
  faq: [
    { q: "How loud does ELEVATE go?", a: "With 50W of primary power plus 20W of tweeters and a 100W peak, it comfortably fills large rooms without distortion." },
    { q: "Do the wireless mics work out of the box?", a: "Yes — pair them via the MIC input; both mics are ready to use with no separate receiver required." },
    { q: "What's the battery life?", a: "About 8 hours of playtime at moderate volume from the 10,000 mAh battery." },
  ],
};

export const PRODUCT_EXPERIENCES: Record<string, ProductExperience> = {
  drift,
  edge,
  drift2,
  dominator,
  core,
  legend,
  elevate,
};

export function getProductExperience(slug: string): ProductExperience | null {
  return PRODUCT_EXPERIENCES[slug] ?? null;
}

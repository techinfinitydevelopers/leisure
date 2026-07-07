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
  colors: ExpColor[];
  texture?: string;
  /** Optional 3D model (glTF/GLB). When set, the roaming 3D model replaces the
   *  2D image plane and is driven by the same scroll track. */
  model?: string;
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
  spinStage: { eyebrow: "Every angle", caption: "See it from all sides." },
  featureFocus: { eyebrow: "Designed around you", caption: "A closer look." },
  overviewModel: { x: 0.36, ry: -0.6, scale: 0.62 }, // right side, turned to face right, smaller
  featuresBackground: true, // model sits behind the feature grid (frosted backdrop)
  featuresModel: { x: -0.32, ry: 0, scale: 0.5 }, // left, front, smaller (background)
  specsModel: { x: -0.16, ry: 0, scale: 0.46 }, // left-of-centre + smaller, clears the right values
  deepDiveModel: { x: 0.34, ry: 0, scale: 0.5 }, // roams to the empty side of each row
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

export const PRODUCT_EXPERIENCES: Record<string, ProductExperience> = {
  drift,
  edge,
  drift2,
};

export function getProductExperience(slug: string): ProductExperience | null {
  return PRODUCT_EXPERIENCES[slug] ?? null;
}

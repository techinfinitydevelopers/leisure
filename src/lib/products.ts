export type ProductColor = {
  name: string;
  hex: string;
  /** folder slug under /public/products/{slug}/{colorSlug}/ */
  folderSlug: string;
};

export type SpecPair = {
  label: string;
  value: string;
};

export type Product = {
  slug: string;
  model: string;
  tagline: string;
  description: string;
  mrp: number;
  price: number;
  colors: ProductColor[];
  specs: SpecPair[];
  inBox: string[];
  technical: SpecPair[];
};

const COLOR_META: Record<string, { hex: string; folderSlug: string }> = {
  Black:      { hex: "#1c1c1c", folderSlug: "black" },
  White:      { hex: "#f3efe6", folderSlug: "white" },
  Orange:     { hex: "#c1502e", folderSlug: "orange" },
  Brown:      { hex: "#5a3b28", folderSlug: "brown" },
  Green:      { hex: "#2f4a3a", folderSlug: "green" },
  Grey:       { hex: "#8d8d86", folderSlug: "light-grey" },
  "Light Grey": { hex: "#b0b0aa", folderSlug: "light-grey" },
};

function colors(...names: string[]): ProductColor[] {
  return names.map((name) => ({
    name,
    hex: COLOR_META[name]?.hex ?? "#888",
    folderSlug: COLOR_META[name]?.folderSlug ?? name.toLowerCase().replace(/ /g, "-"),
  }));
}

/** Returns all image paths for a given product+color (up to `limit`). */
export function getProductImages(slug: string, colorFolderSlug: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `/products/${slug}/${colorFolderSlug}/${i + 1}.jpg`);
}

/** Image counts per product/color — derived from the copied files. */
export const PRODUCT_IMAGE_COUNTS: Record<string, Record<string, number>> = {
  core:      { black: 5, brown: 7, green: 6, white: 4 },
  dominator: { "light-grey": 4, black: 5 },
  drift:     { black: 4, white: 6 },
  edge:      { black: 6, brown: 7, orange: 6, white: 6 },
  elevate:   { black: 7, brown: 6, orange: 5 },
  legend:    { black: 5, brown: 5, green: 5, orange: 6, white: 6 },
};

export const products: Product[] = [
  {
    slug: "drift",
    model: "DRIFT",
    tagline: "Small Size. Massive Sound.",
    mrp: 5999,
    price: 3190,
    colors: colors("Black", "White"),
    description:
      "Meet the DRIFT, your ultimate everyday audio companion designed for life on the move. Compact, stylish, and incredibly lightweight, its water-resistant build seamlessly blends into your active daily routine. Experience crystal-clear sound that travels wherever you go, ensuring your favorite tracks are always by your side, rain or shine.",
    specs: [
      { label: "Battery Capacity", value: "2500 mAh" },
      { label: "Output Power", value: "10W" },
      { label: "Connectivity", value: "Bluetooth 5.3" },
      { label: "Playtime", value: ">8 hours" },
      { label: "Charging Time", value: "3 hours" },
      { label: "Charging Input", value: "Type-C DC 5V" },
    ],
    inBox: ["Speaker", "Dust Bag", "Type-C Cable", "Warranty Card"],
    technical: [
      { label: "Frequency Response", value: "45Hz – 20KHz" },
      { label: "Input Sensitivity", value: "450mV" },
      { label: "Driver Size", value: "50 MM" },
      { label: "Product Weight", value: "336 g" },
      { label: "Product Size", value: "128×49×93 mm" },
    ],
  },
  {
    slug: "edge",
    model: "EDGE",
    tagline: "Sleek look. Unstoppable sound.",
    mrp: 14999,
    price: 8900,
    colors: colors("Black", "White", "Orange"),
    description:
      "Experience the perfect blend of elegance and acoustic brilliance with the Leisure Edge. Designed to complement modern living spaces, it delivers immersive, room-filling sound with deep bass and crystal-clear detail. Whether you're gaming, watching movies, or streaming music, Edge transforms everyday entertainment into a cinematic experience.",
    specs: [
      { label: "Battery Capacity", value: "10000 mAh" },
      { label: "Output Power", value: "15W×2 + 10W×2" },
      { label: "Connectivity", value: "BT / AUX / USB / TWS / Optical" },
      { label: "Playtime", value: ">16 hours" },
      { label: "Charging Time", value: "3:30 hours" },
      { label: "Charging Input", value: "DC 20V 2A 40W" },
    ],
    inBox: [
      "Speaker",
      "AUX Cable",
      "Optical Audio Cable",
      "Warranty Card",
      "Power Adaptor",
    ],
    technical: [
      { label: "Frequency Response", value: "20Hz – 20KHz" },
      { label: "Input Sensitivity", value: "600mV" },
      { label: "Driver Size", value: "2× treble + 2×58 mm bass" },
      { label: "Product Weight", value: "2.17 Kg" },
      { label: "Product Size", value: "500×94×93 mm" },
    ],
  },
  {
    slug: "core",
    model: "CORE",
    tagline: "Power Meets Precision.",
    mrp: 15999,
    price: 9900,
    colors: colors("Black", "Brown", "White", "Green"),
    description:
      "The Leisure Core is where beautiful home decor and powerful, room-filling acoustics live in perfect harmony. Engineered to deliver a refined balance of strong bass and crystal-clear highs, this elegant centerpiece creates an immersive listening experience. It effortlessly brings premium design and soul-soothing performance together to elevate any space.",
    specs: [
      { label: "Battery Capacity", value: "10000 mAh" },
      { label: "Output Power", value: "40W + 10W×2" },
      { label: "Connectivity", value: "BT / AUX / USB / TWS" },
      { label: "Playtime", value: "10 hours" },
      { label: "Charging Time", value: "3:30 hours" },
      { label: "Charging Input", value: "DC 20V 2A 40W" },
    ],
    inBox: ["Speaker", "AUX Cable", "Warranty Card", "Power Adaptor"],
    technical: [
      { label: "Frequency Response", value: "20Hz – 20KHz" },
      { label: "Input Sensitivity", value: "600mV" },
      { label: "Driver Size", value: "2× treble + 4 inch bass" },
      { label: "Product Weight", value: "2.31 Kg" },
      { label: "Product Size", value: "260×152×166 mm" },
    ],
  },
  {
    slug: "legend",
    model: "LEGEND",
    tagline: "Unleash the Legend.",
    mrp: 19999,
    price: 13900,
    colors: colors("Black", "Brown", "Green", "White", "Orange"),
    description:
      "Discover the LEGEND, our perfectly balanced masterpiece designed for those who love to perform. Featuring a built-in handle for effortless carrying and an included wireless microphone, you can easily take your epic karaoke nights anywhere. Gather your friends, enjoy pristine, room-filling sound on the go, and be the absolute star of your own party.",
    specs: [
      { label: "Battery Capacity", value: "10000 mAh" },
      { label: "Output Power", value: "30W + 10W×2" },
      { label: "Connectivity", value: "BT / AUX / USB / MIC / TWS" },
      { label: "Playtime", value: "Up to 9 hours" },
      { label: "Charging Time", value: "2 hours" },
      { label: "Charging Input", value: "DC 20V 2A 40W" },
    ],
    inBox: [
      "Speaker",
      "Wireless Microphone (1)",
      "AUX Cable",
      "Warranty Card",
      "Power Adaptor",
    ],
    technical: [
      { label: "Frequency Response", value: "20Hz – 20KHz" },
      { label: "Input Sensitivity", value: "600mV" },
      { label: "Driver Size", value: "2× treble + 4 inch bass" },
      { label: "Product Weight", value: "2.56 Kg" },
      { label: "Product Size", value: "262×150×176 mm" },
    ],
  },
  {
    slug: "elevate",
    model: "ELEVATE",
    tagline: "Double the Energy.",
    mrp: 24999,
    price: 17900,
    colors: colors("Black", "Brown", "Orange"),
    description:
      "Take your entertainment to new heights with the ELEVATE, designed for those who love to host and perform. Delivering powerful, thumping sound with exceptional clarity, it transforms any space into a live concert experience. Equipped with dual wireless microphones, it enables seamless duets and dynamic performances, making every gathering more energetic and unforgettable.",
    specs: [
      { label: "Battery Capacity", value: "10000 mAh" },
      { label: "Output Power", value: "50W + 10W×2" },
      { label: "Connectivity", value: "BT / AUX / USB / MIC / TWS" },
      { label: "Playtime", value: "8 hours" },
      { label: "Charging Time", value: "2:30 hours" },
      { label: "Peak Power", value: "100 W" },
      { label: "Charging Input", value: "DC 20V 2A 40W" },
    ],
    inBox: [
      "Speaker",
      "Wireless Microphone (2 Nos.)",
      "AUX Cable",
      "Warranty Card",
      "Power Adaptor",
    ],
    technical: [
      { label: "Frequency Response", value: "20Hz – 20KHz" },
      { label: "Input Sensitivity", value: "600mV" },
      { label: "Driver Size", value: "2× treble + 5.35 inch bass" },
      { label: "Product Weight", value: "2.72 Kg" },
      { label: "Product Size", value: "213×148×310 mm" },
    ],
  },
  {
    slug: "dominator",
    model: "DOMINATOR",
    tagline: "Built to Dominate.",
    mrp: 32999,
    price: 25900,
    colors: colors("Black", "Grey"),
    description:
      "Command the ultimate party with the Leisure Dominator, our flagship powerhouse engineered for massive, bone-shaking sound. Designed to deliver a true club-level audio experience, it features dual wireless microphones to handle the most epic, all-night performances. Unleash pure, raw acoustic energy that dominates every space and demands to be heard.",
    specs: [
      { label: "Battery Capacity", value: "20000 mAh" },
      { label: "Output Power", value: "100W + 10W×2 + 20W×2" },
      { label: "Connectivity", value: "BT / AUX / USB / MIC / TWS" },
      { label: "Playtime", value: "9 hours" },
      { label: "Charging Time", value: "3:30 hours" },
      { label: "Charging Input", value: "DC 20V 2A 40W" },
    ],
    inBox: [
      "Speaker",
      "Wireless Microphone (2 Nos.)",
      "AUX Cable",
      "Warranty Card",
      "Power Adaptor",
    ],
    technical: [
      { label: "Frequency Response", value: "45Hz – 20KHz" },
      { label: "Input Sensitivity", value: "600mV" },
      { label: "Driver Size", value: "2× treble + 6.5 inch bass" },
      { label: "Product Weight", value: "4.08 Kg" },
      { label: "Product Size", value: "338×180×240 mm" },
    ],
  },
];

export function getAllProducts(): Product[] {
  return products;
}

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

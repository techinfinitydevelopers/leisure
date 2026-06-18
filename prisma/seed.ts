import { PrismaClient } from "@prisma/client";
import { products } from "../src/lib/products";

const prisma = new PrismaClient();

const DEFAULT_STOCK = 25;

async function main() {
  for (const p of products) {
    const data = {
      model: p.model,
      tagline: p.tagline,
      description: p.description,
      price: p.price,
      mrp: p.mrp,
      stock: DEFAULT_STOCK,
      imageUrl: `/products/${p.slug}.png`,
      colors: JSON.stringify(p.colors),
      specs: JSON.stringify(p.specs),
      inBox: JSON.stringify(p.inBox),
      technical: JSON.stringify(p.technical),
    };

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: { slug: p.slug, ...data },
    });
  }

  const count = await prisma.product.count();
  console.log(`Seeded ${count} products.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

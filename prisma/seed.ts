/**
 * SYNTHETIC SEED DATA - LONEWOLF SPORTSWEAR COMMERCE PLATFORM
 * Purely synthetic data for local development & staging integration testing.
 * ZERO REAL PERSONAL DATA (PII). Idempotent execution.
 */

import { PrismaClient, Role, ContentType, OrderStatus, PaymentStatus, ShipmentStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting synthetic data seeding for LoneWolf Sportswear...");

  // 1. Categories
  const catRunning = await prisma.category.upsert({
    where: { slug: "running-performance" },
    update: {},
    create: {
      name: "Running Performance",
      slug: "running-performance",
      description: "Ultra-breathable apparel engineered for marathoners and sprinters.",
      imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80",
    },
  });

  const catTraining = await prisma.category.upsert({
    where: { slug: "training-gym" },
    update: {},
    create: {
      name: "Training & Gym",
      slug: "training-gym",
      description: "Heavy-duty compression wear and training tees built for maximum mobility.",
      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    },
  });

  const catLifestyle = await prisma.category.upsert({
    where: { slug: "athletes-lifestyle" },
    update: {},
    create: {
      name: "Athletes Lifestyle",
      slug: "athletes-lifestyle",
      description: "Post-workout hoodies, technical joggers, and minimalist streetwear.",
      imageUrl: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80",
    },
  });

  console.log("✅ Seeded Categories: 3 items");

  // 2. Synthetic Products & Variants
  const p1 = await prisma.product.upsert({
    where: { slug: "lonewolf-apex-pro-singlet" },
    update: {},
    create: {
      name: "LoneWolf Apex Pro Singlet",
      slug: "lonewolf-apex-pro-singlet",
      categoryId: catRunning.id,
      description: "Ultra-lightweight aerodynamic singlet with micro-perforated airflow panels. Dries 3x faster than conventional polyester.",
      basePrice: 349000,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80",
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80",
      ],
      variants: {
        create: [
          { sku: "APEX-BLK-S", size: "S", color: "Stealth Black", priceDiff: 0, weightGrams: 120, stock: { create: { totalQuantity: 30 } } },
          { sku: "APEX-BLK-M", size: "M", color: "Stealth Black", priceDiff: 0, weightGrams: 125, stock: { create: { totalQuantity: 45 } } },
          { sku: "APEX-BLK-L", size: "L", color: "Stealth Black", priceDiff: 0, weightGrams: 130, stock: { create: { totalQuantity: 50 } } },
          { sku: "APEX-WHT-M", size: "M", color: "Glacier White", priceDiff: 0, weightGrams: 125, stock: { create: { totalQuantity: 25 } } },
          { sku: "APEX-WHT-L", size: "L", color: "Glacier White", priceDiff: 0, weightGrams: 130, stock: { create: { totalQuantity: 30 } } },
        ],
      },
    },
  });

  const p2 = await prisma.product.upsert({
    where: { slug: "lonewolf-compression-tights-2in1" },
    update: {},
    create: {
      name: "LoneWolf 2-in-1 Tactical Compression Shorts",
      slug: "lonewolf-compression-tights-2in1",
      categoryId: catTraining.id,
      description: "Ergonomic compression liner with anti-chafing flatlock seams and dual concealed phone pockets.",
      basePrice: 429000,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80",
      ],
      variants: {
        create: [
          { sku: "COMP-OLV-M", size: "M", color: "Tactical Olive", priceDiff: 0, weightGrams: 280, stock: { create: { totalQuantity: 40 } } },
          { sku: "COMP-OLV-L", size: "L", color: "Tactical Olive", priceDiff: 0, weightGrams: 290, stock: { create: { totalQuantity: 35 } } },
          { sku: "COMP-BLK-M", size: "M", color: "Stealth Black", priceDiff: 0, weightGrams: 280, stock: { create: { totalQuantity: 50 } } },
          { sku: "COMP-BLK-L", size: "L", color: "Stealth Black", priceDiff: 0, weightGrams: 290, stock: { create: { totalQuantity: 60 } } },
          { sku: "COMP-BLK-XL", size: "XL", color: "Stealth Black", priceDiff: 0, weightGrams: 300, stock: { create: { totalQuantity: 20 } } },
        ],
      },
    },
  });

  const p3 = await prisma.product.upsert({
    where: { slug: "lonewolf-monolith-hoodie" },
    update: {},
    create: {
      name: "LoneWolf Monolith Heavyweight Hoodie",
      slug: "lonewolf-monolith-hoodie",
      categoryId: catLifestyle.id,
      description: "480 GSM French Terry cotton hoodie with reinforced kangaroo pocket and tailored athletic fit.",
      basePrice: 689000,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
      ],
      variants: {
        create: [
          { sku: "HOOD-CHAR-M", size: "M", color: "Charcoal Grey", priceDiff: 0, weightGrams: 650, stock: { create: { totalQuantity: 20 } } },
          { sku: "HOOD-CHAR-L", size: "L", color: "Charcoal Grey", priceDiff: 0, weightGrams: 680, stock: { create: { totalQuantity: 25 } } },
          { sku: "HOOD-BLK-L", size: "L", color: "Stealth Black", priceDiff: 0, weightGrams: 680, stock: { create: { totalQuantity: 30 } } },
        ],
      },
    },
  });

  console.log("✅ Seeded Products & Variants: 3 products, 13 SKU variants with inventory tracking");

  // 3. Synthetic Test Users (Customer & Admin)
  const testAdmin = await prisma.user.upsert({
    where: { email: "admin@lonewolf-test.id" },
    update: {},
    create: {
      email: "admin@lonewolf-test.id",
      name: "LoneWolf Ops Admin",
      phone: "+6281200000001",
      role: Role.SUPERADMIN,
      passwordHash: "$2a$12$syntheticHashForTestingOnlyNotForProductionUseOnly12345",
    },
  });

  const testCustomer = await prisma.user.upsert({
    where: { email: "budi.santoso@lonewolf-test.id" },
    update: {},
    create: {
      email: "budi.santoso@lonewolf-test.id",
      name: "Budi Santoso",
      phone: "+6281200000002",
      role: Role.CUSTOMER,
      passwordHash: "$2a$12$syntheticHashForTestingOnlyNotForProductionUseOnly12345",
      addresses: {
        create: {
          recipient: "Budi Santoso",
          phone: "+6281200000002",
          street: "Jl. Senopati No. 45, Kebayoran Baru",
          city: "Jakarta Selatan",
          province: "DKI Jakarta",
          postalCode: "12190",
          isDefault: true,
        },
      },
    },
  });

  console.log("✅ Seeded Synthetic Test Users: 1 Admin, 1 Customer");

  // 4. Brand Content (Stories, Community, Athletes)
  await prisma.brandContent.upsert({
    where: { slug: "the-lone-wolf-manifesto" },
    update: {},
    create: {
      title: "The Lone Wolf Manifesto: Why We Run in the Dark",
      slug: "the-lone-wolf-manifesto",
      contentType: ContentType.STORY,
      excerpt: "Behind every personal best is an athlete who chose silence, grit, and 4:30 AM alarms.",
      contentHtml: "<p>We do not run for crowds or applause. We run because discipline is freedom. LoneWolf was born from the raw determination of solitary athletes.</p>",
      coverImage: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1200&q=80",
      authorName: "LoneWolf Editorial",
      isPublished: true,
    },
  });

  await prisma.brandContent.upsert({
    where: { slug: "diana-kusuma-marathon-record" },
    update: {},
    create: {
      title: "Athlete Spotlight: Diana Kusuma on Conquering 42.195K",
      slug: "diana-kusuma-marathon-record",
      contentType: ContentType.ATHLETE,
      excerpt: "From road running in Bandung to the podium: How national triathlete Diana Kusuma tests our Apex gear.",
      contentHtml: "<p>Diana tests every stitch of the Apex Pro Singlet under extreme tropical humidity. Her feedback directly shapes our aerodynamic cuts.</p>",
      coverImage: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200&q=80",
      authorName: "Coach Rian",
      isPublished: true,
    },
  });

  await prisma.brandContent.upsert({
    where: { slug: "midnight-run-jakarta-community" },
    update: {},
    create: {
      title: "LoneWolf Midnight Crew: Jakarta Chapter Vol. 04",
      slug: "midnight-run-jakarta-community",
      contentType: ContentType.COMMUNITY,
      excerpt: "Join 150+ athletes every Thursday night at Gelora Bung Karno. All paces welcome.",
      contentHtml: "<p>Community is where solitude meets solidarity. Find our next meetpoint and download the GPS route.</p>",
      coverImage: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&q=80",
      authorName: "Community Captain",
      isPublished: true,
    },
  });

  console.log("✅ Seeded Brand Content: Stories, Athletes, and Community articles");
  console.log("🏁 Synthetic Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

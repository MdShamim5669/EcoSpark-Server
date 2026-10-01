import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting EcoSpark Hub database seeding...");

  // Default Categories
  const categories = [
    { name: "Renewable Energy", description: "Solar, wind, hydro, and clean energy innovations." },
    { name: "Waste Reduction", description: "Zero-waste solutions, composting, and recycling projects." },
    { name: "Water Conservation", description: "Rainwater harvesting, clean water, and watershed protection." },
    { name: "Sustainable Transport", description: "EV solutions, cycling infrastructure, and shared mobility." },
    { name: "Eco Living", description: "Sustainable lifestyle, urban farming, and green products." },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Categories seeded");

  // Admin user (PRD Section 2 & 15)
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SUPER_ADMIN_EMAIL || "admin@ecospark.com";
  const adminPassword = process.env.ADMIN_PASSWORD || process.env.SUPER_ADMIN_PASSWORD || "admin123";
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "EcoSpark Admin",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log(`✅ Admin user seeded (${adminEmail} / ${adminPassword})`);

  // Member user
  const memberPasswordHash = await bcrypt.hash("member123", 12);
  const memberUser = await prisma.user.upsert({
    where: { email: "member@ecospark.com" },
    update: {},
    create: {
      name: "EcoSpark Member",
      email: "member@ecospark.com",
      passwordHash: memberPasswordHash,
      role: Role.MEMBER,
      isActive: true,
    },
  });
  console.log("✅ Demo member seeded (member@ecospark.com / member123)");

  // Seed sample approved ideas if none exist
  const existingIdeasCount = await prisma.idea.count();
  if (existingIdeasCount === 0) {
    const renewableCat = await prisma.category.findUnique({ where: { name: "Renewable Energy" } });
    const wasteCat = await prisma.category.findUnique({ where: { name: "Waste Reduction" } });
    const waterCat = await prisma.category.findUnique({ where: { name: "Water Conservation" } });

    if (renewableCat && wasteCat && waterCat) {
      await prisma.idea.createMany({
        data: [
          {
            title: "Community Solar Microgrid & Shared Storage",
            problemStatement: "High peak electricity costs and fossil-fuel grid dependency during summer brownouts.",
            proposedSolution: "Install decentralized rooftop solar arrays with localized lithium-iron phosphate battery storage shared across 40 residential households.",
            description: "A community-owned microgrid architecture allowing neighbors to trade clean kilowatt-hours with smart metering and real-time mobile tracking.",
            status: "APPROVED",
            isPaid: false,
            authorId: memberUser.id,
            categoryId: renewableCat.id,
            images: ["https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80"],
          },
          {
            title: "Zero-Waste Hyperlocal Composting Hubs",
            problemStatement: "Over 60% of municipal landfill waste consists of compostable organic matter generating methane emissions.",
            proposedSolution: "Establish neighborhood vermicomposting collection bins with an odor-free biofilter and reward tokens for households that divert kitchen scraps.",
            description: "An integrated urban organic waste diversion model connecting restaurants and families with community gardens needing nutrient-rich organic soil.",
            status: "APPROVED",
            isPaid: false,
            authorId: memberUser.id,
            categoryId: wasteCat.id,
            images: ["https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80"],
          },
          {
            title: "IoT Smart Rainwater Harvesting & Filtration Blueprint",
            problemStatement: "Urban groundwater depletion and seasonal stormwater flooding causing street runoff contamination.",
            proposedSolution: "Automated modular rainwater cisterns with ultrasonic depth sensors, pre-sediment leaf filters, and UV-sterilization for non-potable household reuse.",
            description: "Comprehensive step-by-step engineering blueprint and microcontroller code for building an autonomous 2000-liter rooftop rainwater catchment system.",
            status: "APPROVED",
            isPaid: true,
            price: 450.0,
            authorId: memberUser.id,
            categoryId: waterCat.id,
            images: ["https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=1200&q=80"],
          },
        ],
      });
      console.log("✅ Seeded 3 approved community ideas for RAG and platform showcase");
    }
  }

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

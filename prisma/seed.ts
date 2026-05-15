import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env["DATABASE_URL"] as string,
});
const prisma = new PrismaClient({ adapter });

const hashedPassword = await bcrypt.hash("kwakevin", 10);

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data first — order matters because of foreign keys
  // Delete in reverse order of dependencies
  await prisma.message.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️  Cleared existing data");

  // ─── Seed Users ───────────────────────────────────────────────────────────

  const kevin = await prisma.user.upsert({
    where: { email: "kevinuzamurera@gmail.com" },
    update: {
      name: "kevin-01",
    },
    create: {
      name: "kevin",
      email: "kevinuzamurera@gmail.com",
      username: "kevin_host",
      password: hashedPassword,
      phone: "079767892",
      role: "ADMIN",
    },
  });

  // const kelia = await prisma.user.upsert({
  //   where: { email: "kelia@gmail.com" },
  //   update: {
  //     name: "Kelia Green",
  //   },
  //   create: {
  //     name: "Kelia Green",
  //     email: "kelia@gmail.com",
  //     username: "kelia_host",
  //     password: hashedPassword,
  //     phone: "079767892",
  //     role: "HOST",
  //   },
  // });

//   const bob = await prisma.user.upsert({
//     where: { email: "bob@gmail.com" },
//     update: {
//       name: "Bob Smith",
//     },
//     create: {
//       name: "Bob Smith",
//       email: "bob@gmail.com",
//       username: "bob_guest",
//       password: hashedPassword,
//       phone: "079767892",
//       role: "GUEST",
//     },
//   });

//   const carol = await prisma.user.upsert({
//     where: { email: "carol@gmail.com" },
//     update: {
//       name: "Carol White",
//     },
//     create: {
//       name: "Carol White",
//       email: "carol@gmail.com",
//       username: "carol_guest",
//       password: hashedPassword,
//       phone: "079767892",
//       role: "GUEST",
//     },
//   });
//  const max = await prisma.user.upsert({
//     where: { email: "max@gmail.com" },
//     update: {
//       name: "Max Johnson",
//     },
//     create: {
//       name: "Max Johnson",
//       email: "max@gmail.com",
//       username: "max_guest",
//       password: hashedPassword,
//       phone: "079767892",
//       role: "GUEST",
//     },
//   });

  console.log("👥 Created users");

  // ─── Seed Listings ────────────────────────────────────────────────────────

  // const listing = await prisma.listing.createMany({
  //   data:[ {
  //     title: "Cozy apartment in downtown",
  //     location: "New York, NY",
  //     pricePerNight: 120,
  //     guest: 2,
  //     type: "APARTMENT",
  //     amenities: ["WiFi", "Kitchen", "Air conditioning"],
  //     hostId: kevin.id,
  //   },{
  //     title: "Serena apartment in downtown",
  //     location: "Kigali, Rwanda",
  //     pricePerNight: 120,
  //     guest: 2,
  //     type: "VILLA",
  //     amenities: ["WiFi", "Kitchen", "Air conditioning"],
  //     hostId: kelia.id,
  //   },
  //   {
  //     title: "Cozy apartment in downtown",
  //     location: "New York, NY",
  //     pricePerNight: 120,
  //     guest: 2,
  //     type: "APARTMENT",
  //     amenities: ["WiFi", "Kitchen", "Air conditioning"],
  //     hostId: kevin.id,
  //   },{
  //       title: "Mariola apartment in downtown",
  //       location: "Kigali, Rwanda",
  //       pricePerNight: 120,
  //       guest: 2,
  //       type: "CABIN",
  //       amenities: ["WiFi", "Kitchen", "Air conditioning"],
  //       hostId: kelia.id,
  //     },
  //     {
  //       title: "John apartment in downtown",
  //       location: "New York, NY",
  //       pricePerNight: 200,
  //       guest: 2,
  //       type: "HOUSE",
  //       amenities: ["WiFi", "Kitchen", "Air conditioning"],
  //       hostId: kevin.id,
  //     }
  //   ],
  //   skipDuplicates: true,
  // });


  // const listing1 = await prisma.listing.create({
  //   data: {
  //     title: "Greate apartment in downtown",
  //     location: "New York, NY",
  //       pricePerNight: 120,
  //       guest: 2,
  //       type: "APARTMENT",
  //       amenities: ["WiFi", "Kitchen","pool", "Air conditioning"],
  //       hostId: kevin.id,
  // }});

  // const listing2 = await prisma.listing.create({
  //   data: {
  //     title: "Serena apartment in downtown",
  //       location: "Kigali, Rwanda",
  //       pricePerNight: 120,
  //       guest: 2,
  //       type: "VILLA",
  //       amenities: ["WiFi", "Kitchen", "Air conditioning"],
  //       hostId: kelia.id,
  // }});
  

  console.log("no Created listings");

  // ─── Seed Bookings ────────────────────────────────────────────────────────

  // await prisma.booking.create({
  //   data: {
  //     checkIn: new Date("2025-08-01"),
  //     checkOut: new Date("2025-08-05"),
  //     totalPrice: 480, // 4 nights × 120
  //     status: "CONFIRMED",
  //     guestId: bob.id,
  //     listingId: listing1.id,
  //   },
  // });

  // await prisma.booking.create({
  //   data: {
  //     checkIn: new Date("2025-09-10"),
  //     checkOut: new Date("2025-09-15"),
  //     totalPrice: 1250, // 5 nights × 250
  //     status: "PENDING",
  //     guestId: carol.id,
  //     listingId: listing2.id,
  //   },
  // });

  // console.log("📅 Created bookings");
  console.log("✅ Seeding complete!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

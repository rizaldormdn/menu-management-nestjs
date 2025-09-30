import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";

const prisma = new PrismaClient();

async function main() {
  await prisma.menuItem.deleteMany();
  await prisma.menu.deleteMany();

  const headerMenu = await prisma.menu.create({
    data: {
      name: "Header Menu",
      description: "Main navigation header",
      isActive: true,
    },
  });

  const sidebarMenu = await prisma.menu.create({
    data: {
      name: "Sidebar Menu",
      description: "Sidebar navigation",
      isActive: true,
    },
  });

  const footerMenu = await prisma.menu.create({
    data: {
      name: "Footer Menu",
      description: "Footer links",
      isActive: true,
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Dashboard",
      code: "DASHBOARD",
      path: "/dashboard",
      icon: "📊",
      menuId: sidebarMenu.id,
      order: 0,
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Systems",
      code: "SYSTEMS",
      icon: "⚙️",
      menuId: sidebarMenu.id,
      order: 1,
      children: {
        create: [
          {
            name: "System Code",
            code: "SYSTEM_CODE",
            path: "/systems/code",
            icon: "🔢",
            menuId: sidebarMenu.id,
            depth: 1,
            order: 0,
          },
          {
            name: "Properties",
            code: "PROPERTIES",
            path: "/systems/properties",
            icon: "📋",
            menuId: sidebarMenu.id,
            depth: 1,
            order: 1,
          },
        ],
      },
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Menu Management",
      code: "MENU_MANAGEMENT",
      path: "/menus",
      icon: "📁",
      menuId: sidebarMenu.id,
      order: 2,
    },
  });

  console.log("✅ Seed data inserted successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

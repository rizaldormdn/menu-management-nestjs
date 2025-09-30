import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/common/database/prisma/prisma.service";
import { CreateMenuItemDto } from "../dto/create-menu-item.dto";
import { MenuItem } from "../entities/menu-item.entity";
import { MenuItemRepositoryInterface } from "./menu-item.repository.interface";

@Injectable()
export class MenuItemRepository implements MenuItemRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMenuItemDto) {
    // Calculate depth if parentId is provided
    let depth = 0;
    if (data.parentId) {
      const parent = await this.findById(data.parentId);
      depth = parent ? parent.depth + 1 : 0;
    }

    return this.prisma.menuItem.create({
      data: {
        name: data.name,
        code: data.code,
        parentId: data.parentId,
        menuId: data.menuId,
        depth,
        order: data.order || 0,
        isActive: data.isActive,
        path: data.path,
        icon: data.icon,
      },
    });
  }

  async findById(id: string): Promise<MenuItem | null> {
    return this.prisma.menuItem.findUnique({
      where: { id },
    });
  }

  async findAll(): Promise<MenuItem[]> {
    return this.prisma.menuItem.findMany({
      orderBy: [{ menuId: "asc" }, { depth: "asc" }, { order: "asc" }],
    });
  }

  async update(id: string, data: Partial<MenuItem>): Promise<MenuItem> {
    // If parentId is being updated, recalculate depth
    if (data.parentId) {
      const parent = await this.findById(data.parentId);
      data.depth = parent ? parent.depth + 1 : 0;
    }

    return this.prisma.menuItem.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<MenuItem> {
    return this.prisma.menuItem.delete({
      where: { id },
    });
  }

  async findByCode(code: string): Promise<MenuItem | null> {
    return this.prisma.menuItem.findUnique({
      where: { code },
    });
  }

  async findByMenuId(menuId: string): Promise<MenuItem[]> {
    return this.prisma.menuItem.findMany({
      where: { menuId },
      orderBy: [{ depth: "asc" }, { order: "asc" }],
    });
  }

  async findHierarchyByMenuId(menuId: string): Promise<any[]> {
    const allMenuItems = await this.prisma.menuItem.findMany({
      where: {
        menuId,
        isActive: true,
      },
      include: {
        parent: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ depth: "asc" }, { order: "asc" }],
    });

    // Build hierarchy recursively
    const buildHierarchy = (parentId: string | null): any[] => {
      return allMenuItems
        .filter((item) => item.parentId === parentId)
        .map((item) => ({
          ...item,
          parentName: item.parent?.name || null,
          children: buildHierarchy(item.id),
        }));
    };

    // Return root items (parentId = null)
    return buildHierarchy(null);
  }

  async findAllHierarchy(): Promise<any[]> {
    const allMenuItems = await this.prisma.menuItem.findMany({
      include: {
        menu: true,
      },
      orderBy: [{ menuId: "asc" }, { depth: "asc" }, { order: "asc" }],
    });

    // Build hierarchy recursively
    const buildHierarchy = (parentId: string | null): any[] => {
      return allMenuItems
        .filter((item) => item.parentId === parentId)
        .map((item) => ({
          ...item,
          children: buildHierarchy(item.id),
        }));
    };

    // Group by menu dan ambil root items
    const menusMap = new Map();

    allMenuItems.forEach((item) => {
      if (item.depth === 0) {
        // Root items
        if (!menusMap.has(item.menuId)) {
          menusMap.set(item.menuId, {
            menu: item.menu,
            items: [],
          });
        }
        // Build hierarchy untuk root item ini
        const hierarchyItem = {
          ...item,
          children: buildHierarchy(item.id),
        };
        menusMap.get(item.menuId).items.push(hierarchyItem);
      }
    });

    return Array.from(menusMap.values());
  }

  async findAllWithMenu(): Promise<(MenuItem & { menu: any })[]> {
    return this.prisma.menuItem.findMany({
      include: {
        menu: true,
      },
      orderBy: [{ menuId: "asc" }, { depth: "asc" }, { order: "asc" }],
    });
  }

  async findChildren(parentId: string): Promise<MenuItem[]> {
    return this.prisma.menuItem.findMany({
      where: { parentId },
      orderBy: { order: "asc" },
    });
  }

  async updateOrder(id: string, order: number): Promise<MenuItem> {
    return this.prisma.menuItem.update({
      where: { id },
      data: { order },
    });
  }

  async findByPath(path: string | null): Promise<MenuItem | null> {
    return this.prisma.menuItem.findFirst({
      where: {
        path,
        isActive: true,
      },
    });
  }
}

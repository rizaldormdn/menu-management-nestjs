import { Injectable } from "@nestjs/common";
import { Menu } from "../entities/menu.entity";
import { MenuRepositoryInterface } from "./menu.repository.interface";
import { PrismaService } from "src/common/database/prisma/prisma.service";

@Injectable()
export class MenuRepository implements MenuRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<Menu>): Promise<Menu> {
    if (!data.name) {
      throw new Error("Menu name is required");
    }
    return this.prisma.menu.create({
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
      },
    });
  }

  async findById(id: string): Promise<Menu | null> {
    return this.prisma.menu.findUnique({
      where: { id },
    });
  }

  async findWithItemsCount(): Promise<
    (Menu & { _count: { menuItems: number } })[]
  > {
    return this.prisma.menu.findMany({
      include: {
        _count: {
          select: {
            menuItems: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findAll(): Promise<Menu[]> {
    return this.prisma.menu.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, data: Partial<Menu>): Promise<Menu> {
    return this.prisma.menu.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Menu> {
    return this.prisma.menu.delete({
      where: { id },
    });
  }

  async findActiveMenus(): Promise<Menu[]> {
    return this.prisma.menu.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByName(name: string): Promise<Menu | null> {
    return this.prisma.menu.findFirst({
      where: { name },
    });
  }
}

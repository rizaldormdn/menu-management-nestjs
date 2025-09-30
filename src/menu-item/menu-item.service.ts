import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { MenuItemRepository } from "./repositories/menu-item.repository";
import { CreateMenuItemDto } from "./dto/create-menu-item.dto";
import { UpdateMenuItemDto } from "./dto/update-menu-item.dto";
import { MenuItemResponseDto } from "./dto/menu-item-response.dto";
import { MenuRepository } from "src/menu-management/repositories/menu.repository";
import { CreateChildMenuDto } from "./dto/create-chill-menu.dto";

@Injectable()
export class MenuItemService {
  constructor(
    private readonly menuItemRepository: MenuItemRepository,
    private readonly menuRepository: MenuRepository
  ) {}

  private menuToResponseDto(menu: any) {
    return {
      id: menu.id,
      name: menu.name,
      description: menu.description,
      isActive: menu.isActive,
      createdAt: menu.createdAt,
      updatedAt: menu.updatedAt,
    };
  }

  async create(
    createMenuItemDto: CreateMenuItemDto
  ): Promise<MenuItemResponseDto> {
    // Check if menu item with same code already exists
    const existingItem = await this.menuItemRepository.findByCode(
      createMenuItemDto.code
    );
    if (existingItem) {
      throw new ConflictException("Menu item with this code already exists");
    }

    // Validate parent if provided
    if (createMenuItemDto.parentId) {
      const parent = await this.menuItemRepository.findById(
        createMenuItemDto.parentId
      );
      if (!parent) {
        throw new NotFoundException("Parent menu item not found");
      }
      if (parent.menuId !== createMenuItemDto.menuId) {
        throw new BadRequestException("Parent must belong to the same menu");
      }
    }

    const menuItem = await this.menuItemRepository.create({
      ...createMenuItemDto,
      name: createMenuItemDto.name,
    });
    return this.toResponseDto(menuItem);
  }

  async findAll(): Promise<MenuItemResponseDto[]> {
    const menuItems = await this.menuItemRepository.findAll();
    return menuItems.map((item) => this.toResponseDto(item));
  }

  async findByMenuId(menuId: string): Promise<MenuItemResponseDto[]> {
    const menuItems = await this.menuItemRepository.findByMenuId(menuId);
    return menuItems.map((item) => this.toResponseDto(item));
  }

  async findHierarchyByMenuId(menuId: string): Promise<any[]> {
    const hierarchy =
      await this.menuItemRepository.findHierarchyByMenuId(menuId);
    return this.buildHierarchyResponse(hierarchy);
  }

  async findAllActiveMenusWithHierarchy(): Promise<any[]> {
    const activeMenus = await this.menuRepository.findActiveMenus();

    if (activeMenus.length === 0) {
      return [];
    }
    const menusWithHierarchy = await Promise.all(
      activeMenus.map(async (menu) => {
        const hierarchy = await this.menuItemRepository.findHierarchyByMenuId(
          menu.id
        );
        return {
          menu: this.menuToResponseDto(menu),
          hierarchy: this.buildHierarchyResponse(hierarchy),
        };
      })
    );

    return menusWithHierarchy;
  }

  async findOne(id: string): Promise<MenuItemResponseDto> {
    const menuItem = await this.menuItemRepository.findById(id);
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }
    return this.toResponseDto(menuItem);
  }

  async update(
    id: string,
    updateMenuItemDto: UpdateMenuItemDto
  ): Promise<MenuItemResponseDto> {
    const existingItem = await this.menuItemRepository.findById(id);
    if (!existingItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    // If code is being updated, check for duplicates
    if (
      updateMenuItemDto.code &&
      updateMenuItemDto.code !== existingItem.code
    ) {
      const itemWithSameCode = await this.menuItemRepository.findByCode(
        updateMenuItemDto.code
      );
      if (itemWithSameCode) {
        throw new ConflictException("Menu item with this code already exists");
      }
    }

    // Validate parent if being updated
    if (
      updateMenuItemDto.parentId &&
      updateMenuItemDto.parentId !== existingItem.parentId
    ) {
      if (updateMenuItemDto.parentId === id) {
        throw new BadRequestException("Menu item cannot be its own parent");
      }

      const parent = await this.menuItemRepository.findById(
        updateMenuItemDto.parentId
      );
      if (!parent) {
        throw new NotFoundException("Parent menu item not found");
      }

      const menuId = updateMenuItemDto.menuId || existingItem.menuId;
      if (parent.menuId !== menuId) {
        throw new BadRequestException("Parent must belong to the same menu");
      }
    }

    const updatedItem = await this.menuItemRepository.update(id, {
      ...updateMenuItemDto,
      name:
        updateMenuItemDto.name === null ? undefined : updateMenuItemDto.name,
    });
    return this.toResponseDto(updatedItem);
  }

  async remove(id: string): Promise<void> {
    const menuItem = await this.menuItemRepository.findById(id);
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    await this.menuItemRepository.delete(id);
  }

  async updateOrder(id: string, order: number): Promise<MenuItemResponseDto> {
    const menuItem = await this.menuItemRepository.findById(id);
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    const updatedItem = await this.menuItemRepository.updateOrder(id, order);
    return this.toResponseDto(updatedItem);
  }

  async findByPath(path: string): Promise<MenuItemResponseDto | null> {
    const menuItem = await this.menuItemRepository.findByPath(path);
    return menuItem ? this.toResponseDto(menuItem) : null;
  }

  private toResponseDto(menuItem: any): MenuItemResponseDto {
    return {
      id: menuItem.id,
      name: menuItem.name,
      code: menuItem.code,
      parentId: menuItem.parentId,
      parentName: menuItem.parentName,
      menuId: menuItem.menuId,
      depth: menuItem.depth,
      order: menuItem.order,
      path: menuItem.path,
      icon: menuItem.icon,
      isActive: menuItem.isActive,
      createdAt: menuItem.createdAt,
      updatedAt: menuItem.updatedAt,
    };
  }

  async createChild(
    parentId: string,
    createChildMenuDto: CreateChildMenuDto
  ): Promise<MenuItemResponseDto> {
    // Check if parent exists
    const parent = await this.menuItemRepository.findById(parentId);
    if (!parent) {
      throw new NotFoundException(
        `Parent menu item with ID ${parentId} not found`
      );
    }

    // Check if menu item with same code already exists
    const existingItem = await this.menuItemRepository.findByCode(
      createChildMenuDto.code
    );
    if (existingItem) {
      throw new ConflictException("Menu item with this code already exists");
    }

    // Calculate order if not provided
    const order =
      createChildMenuDto.order ?? (await this.getNextOrder(parentId));

    // Create the child menu item
    const menuItem = await this.menuItemRepository.create({
      ...createChildMenuDto,
      parentId: parentId,
      menuId: parent.menuId, // Inherit menuId from parent
      depth: parent.depth + 1, // Depth is parent's depth + 1
      order: order,
      isActive: createChildMenuDto.isActive ?? true,
    });

    return this.toResponseDto(menuItem);
  }

  private async getNextOrder(parentId: string): Promise<number> {
    const children = await this.menuItemRepository.findChildren(parentId);
    if (children.length === 0) {
      return 0;
    }

    // Find the maximum order and add 1
    const maxOrder = Math.max(...children.map((child) => child.order));
    return maxOrder + 1;
  }

  private buildHierarchyResponse(items: any[]): any[] {
    return items.map((item) => ({
      ...this.toResponseDto(item),
      children: item.children ? this.buildHierarchyResponse(item.children) : [],
    }));
  }
}

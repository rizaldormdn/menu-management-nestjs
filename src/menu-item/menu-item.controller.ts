import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { CreateMenuItemDto } from "./dto/create-menu-item.dto";
import { UpdateMenuItemDto } from "./dto/update-menu-item.dto";
import { MenuItemService } from "./menu-item.service";
import { CreateChildMenuDto } from "./dto/create-chill-menu.dto";

@Controller("menu-items")
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  @Post()
  async create(@Body() createMenuItemDto: CreateMenuItemDto) {
    const result = await this.menuItemService.create(createMenuItemDto);
    return {
      success: true,
      message: "Menu item successfully created",
      data: result,
    };
  }

  @Post(":parentId/children")
  async createChild(
    @Param("parentId") parentId: string,
    @Body() createChildMenuDto: CreateChildMenuDto
  ) {
    const result = await this.menuItemService.createChild(
      parentId,
      createChildMenuDto
    );
    return {
      success: true,
      message: "Child menu item successfully created",
      data: result,
    };
  }

  @Get("path/:path")
  async findByPath(@Param("path") path: string) {
    // Decode URL path
    const decodedPath = `/${decodeURIComponent(path)}`;

    const menuItem = await this.menuItemService.findByPath(decodedPath);
    return {
      success: true,
      message: menuItem ? "Menu item found" : "Menu item not found",
      data: menuItem,
    };
  }

  @Get()
  async findAll() {
    const result = await this.menuItemService.findAll();
    return {
      success: true,
      message: result.length
        ? "Menu items retrieved successfully"
        : "No menu items found",
      data: result,
    };
  }

  @Get("menu/:menuId")
  async findByMenuId(@Param("menuId") menuId: string) {
    const result = await this.menuItemService.findByMenuId(menuId);
    return {
      success: true,
      message: result.length
        ? "Menu items for this menu retrieved successfully"
        : `No menu items found for menu with id ${menuId}`,
      data: result,
    };
  }

  @Get("menu/:menuId/hierarchy")
  async findHierarchyByMenuId(@Param("menuId") menuId: string) {
    const result = await this.menuItemService.findHierarchyByMenuId(menuId);
    return {
      success: true,
      message: result.length
        ? "Menu item hierarchy retrieved successfully"
        : `No menu items found for menu with id ${menuId}`,
      data: result,
    };
  }

  @Get("hierarchy/all")
  async findAllHierarchy() {
    const result = await this.menuItemService.findAllActiveMenusWithHierarchy();
    return {
      success: true,
      message: "Menu items retrieved successfully",
      data: result,
    };
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const result = await this.menuItemService.findOne(id);
    return {
      success: !!result,
      message: result ? "Menu item found" : `Menu item with id ${id} not found`,
      data: result,
    };
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto
  ) {
    const result = await this.menuItemService.update(id, updateMenuItemDto);
    return {
      success: true,
      message: "Menu item successfully updated",
      data: result,
    };
  }

  @Patch(":id/order")
  async updateOrder(@Param("id") id: string, @Body("order") order: number) {
    const result = await this.menuItemService.updateOrder(id, order);
    return {
      success: true,
      message: "Menu item order successfully updated",
      data: result,
    };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  async remove(@Param("id") id: string) {
    await this.menuItemService.remove(id);
    return {
      success: true,
      message: `Menu item with id ${id} successfully deleted`,
    };
  }
}

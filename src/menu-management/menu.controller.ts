import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { MenuService } from "./menu.service";
import { CreateMenuDto } from "./dto/create-menu.dto";
import { UpdateMenuDto } from "./dto/update-menu.dto";
import { MenuResponseDto } from "./dto/menu-response.dto";

@Controller("menus")
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  async create(@Body() createMenuDto: CreateMenuDto) {
    const result = await this.menuService.create(createMenuDto);
    return {
      success: true,
      message: "Menu successfully created",
      data: result,
    };
  }

  @Get()
  async findAll() {
    const result = await this.menuService.findAll();
    return {
      success: true,
      message: result.length
        ? "Menus retrieved successfully"
        : "No menus found",
      data: result,
    };
  }

  @Get("active")
  async findActive() {
    const result = await this.menuService.findActiveMenus();
    return {
      success: true,
      message: result.length
        ? "Active menus retrieved successfully"
        : "No active menus found",
      data: result,
    };
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const result = await this.menuService.findOne(id);
    return {
      success: !!result,
      message: result ? "Menu found" : `Menu with id ${id} not found`,
      data: result,
    };
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateMenuDto: UpdateMenuDto) {
    const result = await this.menuService.update(id, updateMenuDto);
    return {
      success: true,
      message: "Menu successfully updated",
      data: result,
    };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  async remove(@Param("id") id: string) {
    await this.menuService.remove(id);
    return {
      success: true,
      message: `Menu with id ${id} successfully deleted`,
    };
  }
}

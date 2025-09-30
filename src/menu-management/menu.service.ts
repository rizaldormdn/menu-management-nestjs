import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { MenuRepository } from "./repositories/menu.repository";
import { MenuResponseDto } from "./dto/menu-response.dto";
import { UpdateMenuDto } from "./dto/update-menu.dto";
import { CreateMenuDto } from "./dto/create-menu.dto";

@Injectable()
export class MenuService {
  constructor(private readonly menuRepository: MenuRepository) {}

  async create(createMenuDto: CreateMenuDto): Promise<MenuResponseDto> {
    // Check if menu with same name already exists
    const existingMenu = await this.menuRepository.findByName(
      createMenuDto.name
    );
    if (existingMenu) {
      throw new ConflictException("Menu with this name already exists");
    }

    const menu = await this.menuRepository.create(createMenuDto);
    return this.toResponseDto(menu);
  }

  async findAll(): Promise<MenuResponseDto[]> {
    const menus = await this.menuRepository.findAll();
    return menus.map((menu) => this.toResponseDto(menu));
  }

  async findActiveMenus(): Promise<MenuResponseDto[]> {
    const menus = await this.menuRepository.findActiveMenus();
    return menus.map((menu) => this.toResponseDto(menu));
  }

  async findOne(id: string): Promise<MenuResponseDto> {
    const menu = await this.menuRepository.findById(id);
    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }
    return this.toResponseDto(menu);
  }

  async update(
    id: string,
    updateMenuDto: UpdateMenuDto
  ): Promise<MenuResponseDto> {
    // Check if menu exists
    const existingMenu = await this.menuRepository.findById(id);
    if (!existingMenu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    // If name is being updated, check for duplicates
    if (updateMenuDto.name && updateMenuDto.name !== existingMenu.name) {
      const menuWithSameName = await this.menuRepository.findByName(
        updateMenuDto.name
      );
      if (menuWithSameName) {
        throw new ConflictException("Menu with this name already exists");
      }
    }

    const updatedMenu = await this.menuRepository.update(id, updateMenuDto);
    return this.toResponseDto(updatedMenu);
  }

  async remove(id: string): Promise<void> {
    const menu = await this.menuRepository.findById(id);
    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    await this.menuRepository.delete(id);
  }

  private toResponseDto(menu: any): MenuResponseDto {
    return {
      id: menu.id,
      name: menu.name,
      description: menu.description,
      isActive: menu.isActive,
      createdAt: menu.createdAt,
      updatedAt: menu.updatedAt,
    };
  }
}

import { BaseRepository } from "src/common/interface/base-repository.interface";
import { Menu } from "../entities/menu.entity";

export interface MenuRepositoryInterface extends BaseRepository<Menu> {
  findActiveMenus(): Promise<Menu[]>;
  findByName(name: string): Promise<Menu | null>;
}

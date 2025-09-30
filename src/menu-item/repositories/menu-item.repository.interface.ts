import { BaseRepository } from "src/common/interface/base-repository.interface";
import { MenuItem } from "../entities/menu-item.entity";

export interface MenuItemRepositoryInterface extends BaseRepository<MenuItem> {
  findByCode(code: string): Promise<MenuItem | null>;
  findByMenuId(menuId: string): Promise<MenuItem[]>;
  findHierarchyByMenuId(menuId: string): Promise<any[]>;
  findChildren(parentId: string): Promise<MenuItem[]>;
  updateOrder(id: string, order: number): Promise<MenuItem>;
  findAllWithMenu(): Promise<(MenuItem & { menu: any })[]>;
  findAllHierarchy(): Promise<any[]>;
}

export class MenuItemResponseDto {
  id: string;
  name: string;
  code: string;
  parentId: string | null;
  parentName: string | null;
  menuId: string;
  depth: number;
  order: number;
  isActive: boolean;
  path?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

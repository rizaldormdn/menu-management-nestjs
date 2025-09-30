export class MenuItem {
  id: string;
  name: string;
  code: string;
  parentId: string | null;
  parentName?: string | null;
  menuId: string;
  depth: number;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  path: string | null;
  icon: string | null;
}

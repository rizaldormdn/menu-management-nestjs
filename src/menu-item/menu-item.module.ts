import { Module } from "@nestjs/common";
import { MenuItemService } from "./menu-item.service";
import { MenuItemController } from "./menu-item.controller";
import { MenuItemRepository } from "./repositories/menu-item.repository";
import { PrismaModule } from "src/common/database/prisma/prisma.module";
import { MenuRepository } from "src/menu-management/repositories/menu.repository";

@Module({
  imports: [PrismaModule],
  controllers: [MenuItemController],
  providers: [MenuItemService, MenuItemRepository, MenuRepository],
  exports: [MenuItemService],
})
export class MenuItemModule {}

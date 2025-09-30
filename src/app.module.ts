import { Module } from "@nestjs/common";
import { MenuModule } from "./menu-management/menu.module";
import { MenuItemModule } from "./menu-item/menu-item.module";

@Module({
  imports: [MenuModule, MenuItemModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

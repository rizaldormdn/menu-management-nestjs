// src/menu-management/dto/create-child-menu.dto.ts
import { IsString, IsOptional, IsBoolean, IsNumber } from "class-validator";

export class CreateChildMenuDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  path?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;
}

import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { PlatformContentBlockInputDto } from './platform-page.dto';

export class UpdatePlatformPageBlocksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlatformContentBlockInputDto)
  blocks!: PlatformContentBlockInputDto[];
}

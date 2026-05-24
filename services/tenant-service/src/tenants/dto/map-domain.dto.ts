import { IsFQDN, IsNotEmpty, IsString } from 'class-validator';

export class MapDomainDto {
  @IsString()
  @IsNotEmpty()
  @IsFQDN()
  domain!: string;
}

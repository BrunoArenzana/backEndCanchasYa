import { PartialType } from '@nestjs/mapped-types';
import { CreateDuenoCanchaDto } from './create-dueno_cancha.dto';

export class UpdateDuenoCanchaDto extends PartialType(CreateDuenoCanchaDto) {}

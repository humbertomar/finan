import { CategoryType } from '../../generated/prisma/enums';

export class CreateCategoryDto {
    name: string;
    type?: CategoryType;
}

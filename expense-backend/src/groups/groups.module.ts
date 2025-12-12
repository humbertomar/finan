import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { InvitesService } from './invites.service';
import { GroupsController } from './groups.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GroupsController],
  providers: [GroupsService, InvitesService],
  exports: [GroupsService, InvitesService],
})
export class GroupsModule { }

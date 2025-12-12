import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { InvitesService } from './invites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
    constructor(
        private readonly groupsService: GroupsService,
        private readonly invitesService: InvitesService,
    ) { }

    @Post()
    create(@Request() req, @Body() createGroupDto: { name: string }) {
        return this.groupsService.create(req.user.userId, createGroupDto);
    }

    @Get()
    findAll(@Request() req) {
        return this.groupsService.findAll(req.user.userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.groupsService.findOne(+id, req.user.userId);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Request() req,
        @Body() updateGroupDto: { name?: string },
    ) {
        return this.groupsService.update(+id, req.user.userId, updateGroupDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.groupsService.remove(+id, req.user.userId);
    }

    @Delete(':id/members/:memberId')
    removeMember(
        @Param('id') id: string,
        @Param('memberId') memberId: string,
        @Request() req,
    ) {
        return this.groupsService.removeMember(+id, req.user.userId, +memberId);
    }

    // Invites routes
    @Post(':id/invites')
    createInvite(
        @Param('id') id: string,
        @Request() req,
        @Body() createInviteDto: { inviteeEmail: string },
    ) {
        return this.invitesService.create(+id, req.user.userId, createInviteDto);
    }

    @Get('invites/pending')
    getPendingInvites(@Request() req) {
        return this.invitesService.findPendingByEmail(req.user.email);
    }

    @Post('invites/:token/accept')
    acceptInvite(@Param('token') token: string, @Request() req) {
        return this.invitesService.accept(token, req.user.userId);
    }

    @Post('invites/:token/reject')
    rejectInvite(@Param('token') token: string, @Request() req) {
        return this.invitesService.reject(token, req.user.userId);
    }
}

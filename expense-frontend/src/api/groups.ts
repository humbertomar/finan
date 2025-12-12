import { api } from './api';

export interface GroupMember {
    id: number;
    userId: number;
    role: 'OWNER' | 'MEMBER';
    joinedAt: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

export interface Group {
    id: number;
    name: string;
    ownerId: number;
    createdAt: string;
    updatedAt: string;
    members: GroupMember[];
    owner: {
        id: number;
        name: string;
        email: string;
    };
    _count?: {
        members: number;
        expenses: number;
    };
}

export interface GroupInvite {
    id: number;
    groupId: number;
    inviteeEmail: string;
    token: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    expiresAt: string;
    createdAt: string;
    group: {
        id: number;
        name: string;
    };
    inviter: {
        name: string;
    };
}

export interface CreateGroupDto {
    name: string;
}

export interface UpdateGroupDto {
    name?: string;
}

export interface CreateInviteDto {
    inviteeEmail: string;
}

// Groups API
export const getGroups = async (): Promise<Group[]> => {
    const response = await api.get('/groups');
    return response.data;
};

export const getGroupDetails = async (id: number): Promise<Group> => {
    const response = await api.get(`/groups/${id}`);
    return response.data;
};

export const createGroup = async (data: CreateGroupDto): Promise<Group> => {
    const response = await api.post('/groups', data);
    return response.data;
};

export const updateGroup = async (id: number, data: UpdateGroupDto): Promise<Group> => {
    const response = await api.patch(`/groups/${id}`, data);
    return response.data;
};

export const deleteGroup = async (id: number): Promise<void> => {
    await api.delete(`/groups/${id}`);
};

export const removeMember = async (groupId: number, memberId: number): Promise<void> => {
    await api.delete(`/groups/${groupId}/members/${memberId}`);
};

// Invites API
export const inviteMember = async (groupId: number, data: CreateInviteDto): Promise<GroupInvite> => {
    const response = await api.post(`/groups/${groupId}/invites`, data);
    return response.data;
};

export const getPendingInvites = async (): Promise<GroupInvite[]> => {
    const response = await api.get('/groups/invites/pending');
    return response.data;
};

export const acceptInvite = async (token: string): Promise<{ message: string; group: Group }> => {
    const response = await api.post(`/groups/invites/${token}/accept`);
    return response.data;
};

export const rejectInvite = async (token: string): Promise<{ message: string }> => {
    const response = await api.post(`/groups/invites/${token}/reject`);
    return response.data;
};

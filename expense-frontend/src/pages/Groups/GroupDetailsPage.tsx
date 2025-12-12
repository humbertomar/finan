import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, Trash2, ArrowLeft, Loader2, UserMinus } from 'lucide-react';
import { getGroupDetails, deleteGroup, removeMember, type Group } from '@/api/groups';
import { InviteDialog } from './InviteDialog';
import { useAuthStore } from '@/auth/store';

export function GroupDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [group, setGroup] = useState<Group | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

    useEffect(() => {
        if (id) {
            fetchGroup();
        }
    }, [id]);

    const fetchGroup = async () => {
        if (!id) return;
        try {
            const data = await getGroupDetails(parseInt(id));
            setGroup(data);
        } catch (error) {
            console.error('Failed to fetch group', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteGroup = async () => {
        if (!group || !confirm('Tem certeza que deseja deletar este grupo?')) return;

        try {
            await deleteGroup(group.id);
            navigate('/groups');
        } catch (error) {
            console.error('Failed to delete group', error);
        }
    };

    const handleRemoveMember = async (memberId: number) => {
        if (!group || !confirm('Tem certeza que deseja remover este membro?')) return;

        try {
            await removeMember(group.id, memberId);
            fetchGroup();
        } catch (error) {
            console.error('Failed to remove member', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!group) {
        return <div>Grupo não encontrado</div>;
    }

    const isOwner = group.ownerId === user?.id;

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/groups')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Users className="h-6 w-6" />
                        {group.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Criado por {group.owner.name}
                    </p>
                </div>
                {isOwner && (
                    <Button variant="destructive" size="sm" onClick={handleDeleteGroup}>
                        <Trash2 className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Deletar</span>
                    </Button>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Membros */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-lg">Membros ({group.members.length})</CardTitle>
                        <Button size="sm" onClick={() => setInviteDialogOpen(true)}>
                            <Mail className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Convidar</span>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {group.members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-3 rounded-lg border"
                            >
                                <div className="flex-1">
                                    <p className="font-medium">{member.user.name}</p>
                                    <p className="text-sm text-muted-foreground">{member.user.email}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {member.role === 'OWNER' && (
                                        <Badge>Dono</Badge>
                                    )}
                                    {isOwner && member.userId !== user?.id && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveMember(member.userId)}
                                        >
                                            <UserMinus className="h-4 w-4 text-red-600" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Despesas Compartilhadas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Despesas Recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {group._count && group._count.expenses > 0 ? (
                            <p className="text-sm text-muted-foreground">
                                {group._count.expenses} despesas compartilhadas neste grupo
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Ainda não há despesas compartilhadas neste grupo
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <InviteDialog
                open={inviteDialogOpen}
                onOpenChange={setInviteDialogOpen}
                groupId={group.id}
                onSuccess={fetchGroup}
            />
        </div>
    );
}

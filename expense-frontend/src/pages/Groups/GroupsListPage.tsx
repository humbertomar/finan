import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Loader2 } from 'lucide-react';
import { getGroups, type Group } from '@/api/groups';
import { GroupDialog } from './GroupDialog';
import { Link } from 'react-router-dom';

export function GroupsListPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const data = await getGroups();
            setGroups(data);
        } catch (error) {
            console.error('Failed to fetch groups', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateGroup = () => {
        setSelectedGroup(null);
        setDialogOpen(true);
    };

    const handleSuccess = () => {
        fetchGroups();
        setDialogOpen(false);
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                        Grupos
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Gerencie grupos para compartilhar despesas
                    </p>
                </div>
                <Button onClick={handleCreateGroup} className="w-full sm:w-auto min-h-[44px]">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Grupo
                </Button>
            </div>

            {groups.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center mb-4">
                            Você ainda não participa de nenhum grupo
                        </p>
                        <Button onClick={handleCreateGroup}>
                            <Plus className="mr-2 h-4 w-4" />
                            Criar Primeiro Grupo
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {groups.map((group) => (
                        <Link key={group.id} to={`/groups/${group.id}`}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="h-5 w-5" />
                                                {group.name}
                                            </CardTitle>
                                        </div>
                                        {group.owner.id === group.ownerId && (
                                            <Badge variant="secondary">Dono</Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span>{group._count?.members || group.members.length} membros</span>
                                    </div>

                                    <div className="flex flex-wrap gap-1">
                                        {group.members.slice(0, 3).map((member) => (
                                            <Badge key={member.id} variant="outline" className="text-xs">
                                                {member.user.name}
                                            </Badge>
                                        ))}
                                        {group.members.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{group.members.length - 3}
                                            </Badge>
                                        )}
                                    </div>

                                    {group._count && group._count.expenses > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            {group._count.expenses} despesas compartilhadas
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            <GroupDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                groupToEdit={selectedGroup}
                onSuccess={handleSuccess}
            />
        </div>
    );
}

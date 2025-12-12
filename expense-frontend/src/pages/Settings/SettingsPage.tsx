import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ModeToggle } from '@/components/mode-toggle';
import { Switch } from '@/components/ui/switch';
import { useAuthStore } from '@/auth/store';
import { User, Bell, DollarSign, Upload } from 'lucide-react';

// Preset gradient avatars
const PRESET_AVATARS = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
];

export function SettingsPage() {
    const { user, updateUser } = useAuthStore();
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [showAvatarGallery, setShowAvatarGallery] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [isSaving, setIsSaving] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (2MB max)
            if (file.size > 2 * 1024 * 1024) {
                alert('Arquivo muito grande! Máximo 2MB.');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Apenas imagens são permitidas!');
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarSelect = (gradient: string) => {
        setAvatarPreview(gradient);
    };

    const handleSaveProfile = async () => {
        if (!name.trim()) {
            alert('Nome não pode estar vazio!');
            return;
        }

        if (!email.trim() || !email.includes('@')) {
            alert('Email inválido!');
            return;
        }

        setIsSaving(true);
        try {
            // TODO: Implement API call to update user profile
            // await api.updateProfile({ name, email, avatar: avatarPreview });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update user in store to persist changes
            updateUser({
                name,
                email,
                avatar: avatarPreview || user?.avatar
            });

            // Clear preview state since it's now in the store
            setAvatarPreview(null);

            alert('✅ Perfil atualizado com sucesso!');
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('❌ Erro ao salvar alterações. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        const currentPassword = (document.getElementById('current-password') as HTMLInputElement)?.value;
        const newPassword = (document.getElementById('new-password') as HTMLInputElement)?.value;
        const confirmPassword = (document.getElementById('confirm-password') as HTMLInputElement)?.value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Preencha todos os campos de senha!');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }

        if (newPassword.length < 6) {
            alert('A nova senha deve ter no mínimo 6 caracteres!');
            return;
        }

        try {
            // TODO: Implement API call to change password
            // await api.changePassword({ currentPassword, newPassword });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            alert('✅ Senha alterada com sucesso!');

            // Clear form
            (document.getElementById('current-password') as HTMLInputElement).value = '';
            (document.getElementById('new-password') as HTMLInputElement).value = '';
            (document.getElementById('confirm-password') as HTMLInputElement).value = '';
        } catch (error) {
            console.error('Error changing password:', error);
            alert('❌ Erro ao alterar senha. Verifique sua senha atual.');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
                <p className="text-muted-foreground">Gerencie suas preferências e informações pessoais.</p>
            </div>

            {/* User Profile */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Perfil do Usuário
                    </CardTitle>
                    <CardDescription>Atualize suas informações pessoais e foto de perfil.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <Avatar className="h-24 w-24 border-4 border-muted">
                            <AvatarImage src={avatarPreview || user?.avatar} alt={user?.name || 'User'} />
                            <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-4 w-full">
                            {/* Tabs for Upload vs Avatar Selection */}
                            <div className="flex gap-2 border-b">
                                <button
                                    className={`px-4 py-2 font-medium transition-colors ${!showAvatarGallery
                                            ? 'border-b-2 border-primary text-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    onClick={() => setShowAvatarGallery(false)}
                                >
                                    <Upload className="h-4 w-4 inline mr-2" />
                                    Upload
                                </button>
                                <button
                                    className={`px-4 py-2 font-medium transition-colors ${showAvatarGallery
                                            ? 'border-b-2 border-primary text-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    onClick={() => setShowAvatarGallery(true)}
                                >
                                    <User className="h-4 w-4 inline mr-2" />
                                    Avatares
                                </button>
                            </div>

                            {/* Upload Tab */}
                            {!showAvatarGallery && (
                                <div className="space-y-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAvatarClick}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Escolher Foto
                                    </Button>
                                    <p className="text-xs text-muted-foreground">
                                        JPG, PNG ou GIF. Máx 2MB.
                                    </p>
                                </div>
                            )}

                            {/* Avatar Gallery Tab */}
                            {showAvatarGallery && (
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Escolha um avatar pré-definido
                                    </p>
                                    <div className="grid grid-cols-4 gap-3">
                                        {PRESET_AVATARS.map((avatar, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleAvatarSelect(avatar)}
                                                className={`
                                                    h-16 w-16 rounded-full transition-all hover:scale-110
                                                    ${avatarPreview === avatar ? 'ring-4 ring-primary shadow-lg' : 'ring-2 ring-muted hover:ring-primary/50'}
                                                `}
                                                style={{ background: avatar }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="username">Nome</Label>
                            <Input
                                id="username"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
                <CardHeader>
                    <CardTitle>Aparência</CardTitle>
                    <CardDescription>Personalize a interface do aplicativo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Tema</Label>
                            <p className="text-sm text-muted-foreground">
                                Alterne entre tema claro, escuro ou automático
                            </p>
                        </div>
                        <ModeToggle />
                    </div>
                </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Preferências
                    </CardTitle>
                    <CardDescription>Configure o formato de exibição e notificações.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="currency">Moeda</Label>
                            <p className="text-sm text-muted-foreground">
                                Formato de exibição de valores monetários
                            </p>
                        </div>
                        <div className="w-32">
                            <Input id="currency" defaultValue="BRL (R$)" disabled />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex items-center gap-2">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <Label htmlFor="notifications">Notificações</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receba lembretes de despesas fixas
                                </p>
                            </div>
                        </div>
                        <Switch id="notifications" defaultChecked />
                    </div>
                </CardContent>
            </Card>

            {/* Security */}
            <Card>
                <CardHeader>
                    <CardTitle>Segurança</CardTitle>
                    <CardDescription>Altere sua senha e gerencie o acesso à conta.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Senha Atual</Label>
                        <Input id="current-password" type="password" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">Nova Senha</Label>
                            <Input id="new-password" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirmar Senha</Label>
                            <Input id="confirm-password" type="password" />
                        </div>
                    </div>
                    <Button variant="destructive" onClick={handleChangePassword}>
                        Alterar Senha
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

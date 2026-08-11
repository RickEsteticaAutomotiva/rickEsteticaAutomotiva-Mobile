import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alerta } from '../../components/Alerta';
import { EstadoCarregamento } from '../../components/EstadoCarregamento';
import { useAuth } from '../../context/AuthContext';
import { usuarioService } from '../../services/UsuarioService';
import { formatarDataSimples } from '../../utils';
import { router } from 'expo-router';

const ROTULOS_ROLE: Record<string, string> = {
    ROLE_ADMIN: 'Administrador',
    ROLE_GERENTE: 'Gerente',
    ROLE_CLIENTE: 'Cliente',
};

type Perfil = {
    id: number | string;
    nome?: string;
    email?: string;
    telefone?: string;
    cpf?: string;
    dataNascimento?: string;
    roles?: string[];
};

function normalizarPerfil(response: unknown): Perfil | null {
    if (!response || typeof response !== 'object') {
        return null;
    }

    const dados = response as Record<string, unknown>;

    if (dados.id === undefined || dados.id === null) {
        return null;
    }

    return {
        id: dados.id as number | string,
        nome: dados.nome ? String(dados.nome) : undefined,
        email: dados.email ? String(dados.email) : undefined,
        telefone: dados.telefone ? String(dados.telefone) : undefined,
        cpf: dados.cpf ? String(dados.cpf) : undefined,
        dataNascimento: dados.dataNascimento ? String(dados.dataNascimento) : undefined,
        roles: Array.isArray(dados.roles) ? dados.roles.map(String) : undefined,
    };
}

export default function Configuracoes() {
    const { user, logout } = useAuth();

    const [perfil, setPerfil] = useState<Perfil | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [saindo, setSaindo] = useState(false);

    const carregarPerfil = useCallback(async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        setErro(null);

        try {
            const response = await usuarioService.obterPerfil(user.id);
            setPerfil(normalizarPerfil(response));
        } catch (error) {
            const mensagem =
                error instanceof Error ? error.message : 'Não foi possível carregar seus dados.';
            setErro(mensagem);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        carregarPerfil();
    }, [carregarPerfil]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await carregarPerfil();
        setRefreshing(false);
    }, [carregarPerfil]);

    async function handleLogout() {
        if (saindo) {
            return;
        }

        setSaindo(true);
        try {
            await logout();
        } finally {
            setSaindo(false);
        }
    }

    if (loading) {
        return <EstadoCarregamento mensagem="Carregando seus dados..." />;
    }

    const roles = (perfil?.roles ?? []).map((role) => ROTULOS_ROLE[role] ?? role);

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-gray-100">
        <ScrollView
            className="flex-1 bg-gray-100"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View className="items-center bg-white pb-6 pt-8">
                <View className="h-20 w-20 items-center justify-center rounded-full bg-gray-200">
                    <Ionicons name="person" size={40} color="#696b6e" />
                </View>

                <Text className="mt-3 text-xl font-bold text-gray-900">
                    {perfil?.nome || 'Usuário'}
                </Text>

                {roles.length > 0 ? (
                    <Text className="mt-1 text-sm text-gray-500">{roles.join(', ')}</Text>
                ) : null}
            </View>

            <Pressable
                onPress={() => {
                    router.push({
                        pathname: '/historico'
                    });
                }}
                className="mt-5 flex-row items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm border border-gray-200"
            >
                <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={20} color="#696b6e" />
                    <Text className="ml-3 text-base text-gray-900">Histórico de agendamentos</Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#696b6e" />
            </Pressable>

            <View className="m-5">
                {erro ? <Alerta mensagem={erro} /> : null}

                <View className="rounded-xl border border-gray-200 bg-white">
                    <InfoLinha icone="mail-outline" label="E-mail" valor={perfil?.email} />
                    <InfoLinha icone="call-outline" label="Telefone" valor={perfil?.telefone} />
                    <InfoLinha icone="card-outline" label="CPF" valor={perfil?.cpf} />
                    <InfoLinha
                        icone="calendar-outline"
                        label="Data de nascimento"
                        valor={perfil?.dataNascimento ? formatarDataSimples(perfil.dataNascimento) : undefined}
                        ultimo
                    />
                </View>

                <Pressable
                    onPress={handleLogout}
                    disabled={saindo}
                    className="mt-6 h-14 flex-row items-center justify-center rounded-lg border border-red-700"
                >
                    {saindo ? (
                        <ActivityIndicator color="#B30000" />
                    ) : (
                        <>
                            <Ionicons name="log-out-outline" size={20} color="#B30000" />
                            <Text className="ml-2 text-base font-semibold text-red-700">Sair</Text>
                        </>
                    )}
                </Pressable>
            </View>
        </ScrollView>
        </SafeAreaView>
    );
}

type InfoLinhaProps = {
    icone: keyof typeof Ionicons.glyphMap;
    label: string;
    valor?: string;
    ultimo?: boolean;
};

function InfoLinha({ icone, label, valor, ultimo = false }: InfoLinhaProps) {
    return (
        <View
            className={`flex-row items-center px-4 py-4 ${ultimo ? '' : 'border-b border-gray-100'}`}
        >
            <Ionicons name={icone} size={20} color="#696b6e" />

            <View className="ml-3 flex-1">
                <Text className="text-xs text-gray-500">{label}</Text>
                <Text className="text-base text-gray-900">{valor || 'Não informado'}</Text>
            </View>
        </View>
    );
}

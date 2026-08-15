import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alerta } from '../../components/Alerta';
import { ConfiguracaoItem } from '../../components/ConfiguracaoItem';
import { EstadoCarregamento } from '../../components/EstadoCarregamento';
import { useAuth } from '../../context/AuthContext';
import { usuarioService } from '../../services/UsuarioService';
import { normalizarPerfil } from '../../utils/normalizacao';
import type { Perfil } from '../../types';
import { router, useFocusEffect } from 'expo-router';

const ROTULOS_ROLE: Record<string, string> = {
    ROLE_ADMIN: 'Administrador',
    ROLE_GERENTE: 'Gerente',
    ROLE_CLIENTE: 'Cliente',
};

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

    // useFocusEffect (em vez de useEffect simples) garante que, ao voltar de
    // Editar perfil, os dados exibidos aqui reflitam a alteração salva.
    useFocusEffect(
        useCallback(() => {
            carregarPerfil();
        }, [carregarPerfil])
    );

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
        <SafeAreaView edges={['top']} className="flex-1" style={{ backgroundColor: '#B30000' }}>
        <ScrollView
            className="flex-1 bg-gray-100"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View className="items-center pb-6 pt-8" style={{ backgroundColor: '#B30000' }}>
                <View className="h-20 w-20 items-center justify-center rounded-full bg-gray-200">
                    <Ionicons name="person" size={40} color="#696b6e" />
                </View>

                <Text className="mt-3 text-xl font-bold text-white">
                    {perfil?.nome || 'Usuário'}
                </Text>

                {roles.length > 0 ? (
                    <Text className="mt-1 text-sm text-gray-100">{roles.join(', ')}</Text>
                ) : null}
            </View>

            <View className="my-4 mx-2">
                {erro ? <Alerta mensagem={erro} /> : null}

                <View className="bg-white rounded-lg p-2 shadow-md mb-4">
                    <ConfiguracaoItem
                        icone="person-outline"
                        titulo="Editar perfil"
                        subtitulo="Altere seus dados pessoais"
                        onPress={() => router.push('/editar-perfil')}
                    />

                    <ConfiguracaoItem
                        icone="car-outline"
                        titulo="Meus veículos"
                        subtitulo="Gerencie seus veículos"
                        onPress={() => router.push('/veiculos')}
                    />
                </View>

                <View className="bg-white rounded-lg p-2 shadow-md">
                    <ConfiguracaoItem
                        icone="heart-outline"
                        titulo="Serviços favoritos"
                        subtitulo="Veja seus serviços salvos"
                        onPress={() => router.push('/favoritos')}
                    />

                    <ConfiguracaoItem
                        icone="time-outline"
                        titulo="Histórico de agendamentos"
                        subtitulo="Veja seus agendamentos passados"
                        onPress={() => router.push('/historico')}
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

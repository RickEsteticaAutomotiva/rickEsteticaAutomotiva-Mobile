import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiService } from '../services/ApiService';
import { authService } from '../services/AuthService';

/**
 * @typedef {{ id: number|string, email?: string, nome?: string, roles?: string[] }} Usuario
 * @typedef {{
 *   user: Usuario | null,
 *   loading: boolean,
 *   isAuthenticated: boolean,
 *   login: (email: string, senha: string) => Promise<any>,
 *   cadastrar: (dadosCadastro: any) => Promise<any>,
 *   logout: () => Promise<void>,
 *   updateUser: (novosDados: Partial<Usuario>) => Promise<void>,
 *   hasRole: (role: string) => boolean,
 *   getToken: () => Promise<string | null>,
 *   checkAuthStatus: () => Promise<void>,
 * }} AuthContextValue
 */

/** @type {import('react').Context<AuthContextValue | null>} */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(/** @type {Usuario | null} */ (null));
    const [loading, setLoading] = useState(true);

    const logout = useCallback(async () => {
        await authService.clearAuthData();
        setUser(null);
        router.replace('/login');
    }, []);

    // O ApiService avisa aqui quando uma requisição autenticada recebe 401
    // (token expirado/inválido), centralizando a limpeza de sessão em um único
    // lugar em vez de duplicar esse tratamento em cada tela.
    useEffect(() => {
        apiService.setOnUnauthorized(() => {
            setUser(null);
            router.replace('/login');
        });

        return () => apiService.setOnUnauthorized(null);
    }, []);

    const checkAuthStatus = useCallback(async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const userData = await AsyncStorage.getItem('userData');

            if (!token || !userData) {
                setUser(null);
                return;
            }

            if (authService.isTokenExpired(token)) {
                await authService.clearAuthData();
                setUser(null);
                return;
            }

            const verifiedUser = await authService.verificarToken();
            setUser(verifiedUser);
        } catch (error) {
            console.error('Erro na verificação de autenticação:', error.message);
            await authService.clearAuthData();
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const login = useCallback(async (email, senha) => {
        const response = await authService.login(email, senha);

        await AsyncStorage.multiSet([
            ['token', response.token],
            ['userData', JSON.stringify(response.user)],
        ]);

        setUser(response.user);

        return response;
    }, []);

    const cadastrar = useCallback(async (dadosCadastro) => {
        const response = await authService.cadastrar(dadosCadastro);

        // O backend atual não autentica automaticamente após o cadastro (não
        // retorna token). Só persistimos sessão aqui se um token vier na resposta.
        if (response.token) {
            await AsyncStorage.multiSet([
                ['token', response.token],
                ['userData', JSON.stringify(response.user)],
            ]);
            setUser(response.user);
        }

        return response;
    }, []);

    const updateUser = useCallback(async (novosDados) => {
        setUser((atual) => {
            const usuarioAtualizado = { ...atual, ...novosDados };
            AsyncStorage.setItem('userData', JSON.stringify(usuarioAtualizado));
            return usuarioAtualizado;
        });
    }, []);

    const hasRole = useCallback(
        (role) => user?.roles?.includes(role) ?? false,
        [user]
    );

    const getToken = useCallback(async () => {
        const token = await AsyncStorage.getItem('token');

        if (token && authService.isTokenExpired(token)) {
            await logout();
            return null;
        }

        return token;
    }, [logout]);

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated,
                login,
                cadastrar,
                logout,
                updateUser,
                hasRole,
                getToken,
                checkAuthStatus,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de AuthProvider');
    }
    return context;
}

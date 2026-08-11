import { apiService } from './ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class AuthService {
    BASE_URL = '/pessoas';

    async login(email, senha) {
        try {            
            // Garantir que os dados estão no formato correto
            const loginData = {
                email: email.trim(),
                senha: senha
            };
                        
            const response = await apiService.post(`${this.BASE_URL}/login`, loginData);
            
            
            if (response && response.token) {
                const userData = {
                    id: response.id,
                    email: response.email,
                    nome: response.nome,
                    roles: response.roles || [],
                };
                
                return {
                    token: response.token,
                    user: userData,
                    expiresIn: this.getTokenExpirationTime(response.token)
                };
            }
            
            throw new Error('Token não encontrado na resposta');
        } catch (error) {
            console.error('Erro no login:', error);
            throw new Error(error.message || 'Erro ao fazer login');
        }
    }

    async cadastrar(userData) {
        try {
            const response = await apiService.post(`${this.BASE_URL}/`, userData);

            // O endpoint POST /pessoas atual (PessoaController.cadastrar) retorna
            // apenas o PessoaResponse criado, sem token — o usuário precisa fazer
            // login em seguida. Este branch fica pronto caso o backend passe a
            // autenticar automaticamente após o cadastro.
            if (response && response.token) {
                const user = {
                    id: response.id,
                    email: response.email,
                    nome: response.nome,
                    roles: response.roles || [],
                };

                return {
                    token: response.token,
                    user,
                    expiresIn: this.getTokenExpirationTime(response.token)
                };
            }

            return {
                user: response
            };
        } catch (error) {
            throw new Error(error.message || 'Erro ao cadastrar');
        }
    }

    async verificarToken() {
        const token = await AsyncStorage.getItem('token');
        const userData = await AsyncStorage.getItem('userData');
        
        if (!token || !userData) {
            throw new Error('Token ou dados do usuário não encontrados');
        }

        try {
            const user = JSON.parse(userData);
            
            // Verificar se token não expirou
            if (this.isTokenExpired(token)) {
                throw new Error('Token expirado');
            }
            
            return user;
        } catch (error) {
            throw new Error('Token inválido ou expirado');
        }
    }

    async refreshToken() {
        // Endpoint de refresh não implementado no backend.
        // Quando disponibilizado, substituir pelo POST para /pessoas/refresh-token.
        throw new Error('Sessão expirada, faça login novamente');
    }

    // Métodos auxiliares para JWT
    jwtDecode(token) {
        try {
            if (!token || typeof token !== 'string') {
                return null;
            }
            
            const parts = token.split('.');
            if (parts.length !== 3) {
                return null;
            }
            
            const payload = parts[1];
            return JSON.parse(atob(payload));
        } catch (error) {
            console.error('Erro ao decodificar token:', error);
            return null;
        }
    }

    isTokenExpired(token) {
        const decoded = this.jwtDecode(token);
        if (!decoded || !decoded.exp) {
            return true;
        }
        return decoded.exp < Date.now() / 1000;
    }

    getTokenExpirationTime(token) {
        const decoded = this.jwtDecode(token);
        if (!decoded || !decoded.exp || !decoded.iat) {
            return 3600; // 1 hora como padrão
        }
        return decoded.exp - decoded.iat;
    }

    async esquecerSenha(email) {
        try {
            await apiService.post(`${this.BASE_URL}/esqueci-senha`, { email: email.trim().toLowerCase() });
        } catch (error) {
            throw new Error(error.message || 'Erro ao solicitar redefinição de senha');
        }
    }

    async redefinirSenha(token, novaSenha) {
        try {
            await apiService.post(`${this.BASE_URL}/redefinir-senha`, { token, novaSenha });
        } catch (error) {
            throw new Error(error.message || 'Erro ao redefinir senha');
        }
    }

    // Método para limpar dados de autenticação
    async clearAuthData() {
        await AsyncStorage.multiRemove([
            'token',
            'userData',
            'tokenExpiry'
        ]);
    }
}

export const authService = new AuthService();
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { jwtDecode } from 'jwt-decode';

export const API_BASE_URL = 'http://192.168.1.2:8080/api/';

function extrairMensagemErro(data, statusPadrao) {
    if (!data) {
        return statusPadrao;
    }

    // Backend responde no formato RFC 7807 (ProblemDetail): a mensagem legível
    // vem em `detail`. `message` é mantido como fallback por segurança.
    const mensagemBase = data.detail || data.message || statusPadrao;

    if (Array.isArray(data.campos) && data.campos.length > 0) {
        return `${mensagemBase}: ${data.campos.join(', ')}`;
    }

    return mensagemBase;
}

class ApiService {
    async getStoredToken() {
        try {
            return await AsyncStorage.getItem('token');
        } catch (_error) {
            return null;
        }
    }

    async clearAuthStorage() {
        try {
            await AsyncStorage.multiRemove([
                'token',
                'userData',
                'tokenExpiry'
            ]);
        } catch (_error) {
        }
    }

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            timeout: 10000, // 10 segundos de timeout
        });

        // Interceptor para adicionar token automaticamente
        this.api.interceptors.request.use(
            async (config) => {
                const token = await this.getStoredToken();
                
                // Endpoints públicos que não precisam de token (incluindo versões com barra)
                const isLoginRequest = config.url === '/pessoas/login';
                const isCadastroRequest = (config.url === '/pessoas' || config.url === '/pessoas/') && config.method === 'post';
                const isEsqueciSenhaRequest = config.url === '/pessoas/esqueci-senha';
                const isRedefinirSenhaRequest = config.url === '/pessoas/redefinir-senha';
                const isPublicEndpoint = isLoginRequest || isCadastroRequest || isEsqueciSenhaRequest || isRedefinirSenhaRequest;
                
                // Só adicionar token se:
                // 1. Token existe
                // 2. Não é um endpoint público
                // 3. Token não expirou
                if (token && !isPublicEndpoint) {
                    try {
                        const payload = jwtDecode(token);
                        if (payload.exp && payload.exp < Date.now() / 1000) {
                            // Token expirado, limpar dados de auth e não enviar
                            await this.clearAuthStorage();
                            return config;
                        }
                        
                        config.headers.Authorization = `Bearer ${token}`;
                    } catch (_error) {
                        // Se erro na validação, não adicionar token
                    }
                }
                
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Interceptor para tratar respostas e erros
        this.api.interceptors.response.use(
            (response) => {
                return response.data;
            },
            async (error) => {
                const originalRequest = error.config;
                
                if (error.response) {
                    const { status, data } = error.response;
                    
                    switch (status) {
                        case 401:
                            // Para login/cadastro, retornar erro específico
                            if (originalRequest.url?.includes('/login')) {
                                throw new Error(extrairMensagemErro(data, 'Credenciais inválidas'));
                            }

                            if (originalRequest.url?.includes('/pessoas') && originalRequest.method === 'post') {
                                throw new Error(extrairMensagemErro(data, 'Erro ao cadastrar usuário'));
                            }

                            // Para outras requisições, token expirado ou inválido
                            if (!originalRequest._retry) {
                                originalRequest._retry = true;
                                await this.clearAuthStorage();
                                this.onUnauthorized?.();
                            }
                            throw new Error('Sessão expirada. Faça login novamente.');

                        case 403:
                            throw new Error(extrairMensagemErro(data, 'Acesso negado'));

                        case 404:
                            throw new Error(extrairMensagemErro(data, 'Recurso não encontrado'));

                        case 500:
                            throw new Error(extrairMensagemErro(data, 'Erro interno do servidor'));

                        default:
                            throw new Error(extrairMensagemErro(data, `Erro ${status}`));
                    }
                } else if (error.request) {
                    throw new Error('Erro de conexão com o servidor');
                } else {
                    throw new Error(error?.message || 'Erro inesperado');
                }
            }
        );
    }

    async get(endpoint, config = {}) {
        try {
            return await this.api.get(endpoint, config);
        } catch (error) {
            throw error;
        }
    }

    async post(endpoint, data = {}, config = {}) {
        try {
            return await this.api.post(endpoint, data, config);
        } catch (error) {
            throw error;
        }
    }

    async put(endpoint, data = {}, config = {}) {
        try {
            return await this.api.put(endpoint, data, config);
        } catch (error) {
            throw error;
        }
    }

    async patch(endpoint, data = {}, config = {}) {
        try {
            return await this.api.patch(endpoint, data, config);
        } catch (error) {
            throw error;
        }
    }

    async delete(endpoint, config = {}) {
        try {
            return await this.api.delete(endpoint, config);
        } catch (error) {
            throw error;
        }
    }

    // Método para upload de arquivos
    async uploadFile(endpoint, file, onUploadProgress = null) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            return await this.api.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress,
            });
        } catch (error) {
            throw error;
        }
    }

    // Método para requisições com parâmetros de query
    async getWithParams(endpoint, params = {}) {
        try {
            return await this.api.get(endpoint, { params });
        } catch (error) {
            throw error;
        }
    }

    async getToken() {
        return await this.getStoredToken();
    }

    // Permite que a camada de autenticação (AuthContext) seja avisada quando
    // uma requisição autenticada recebe 401, centralizando o tratamento de
    // sessão expirada/token inválido em um único lugar.
    setOnUnauthorized(callback) {
        this.onUnauthorized = callback;
    }
}

export const apiService = new ApiService();
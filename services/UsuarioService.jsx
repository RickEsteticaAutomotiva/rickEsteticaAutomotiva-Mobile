import { apiService } from './ApiService';

export class UsuarioService {
    BASE_URL = '/pessoas';

    async obterPerfil(id) {
        try {
            const response = await apiService.get(`${this.BASE_URL}/${id}`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao obter informações do usuário');
        }
    }

    async atualizarPerfil(id, dadosAtualizados) {
        try {
            const response = await apiService.put(`${this.BASE_URL}/${id}`, dadosAtualizados);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao atualizar informações do usuário');
        }
    }

    async deletarUsuario(id) {
        try {
            const response = await apiService.delete(`${this.BASE_URL}/${id}`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao deletar usuário');
        }
    }

    async alterarSenha(userId, senhaData) {
        try {
            const response = await apiService.patch(`${this.BASE_URL}/${userId}/senha`, senhaData);
            return response;
        } catch (error) {
            throw new Error('Erro ao alterar senha. Verifique a senha atual.');
        }
    }
}

export const usuarioService = new UsuarioService();
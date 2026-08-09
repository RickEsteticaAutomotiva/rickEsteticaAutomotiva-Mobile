import { apiService } from './ApiService';

export class CarrinhoService {
    BASE_URL = '/carrinhos';

    async buscarCarrinhoUsuario(idPessoa) {
        try {
            const response = await apiService.get(`${this.BASE_URL}/pessoa/${idPessoa}`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao buscar carrinho do usuário');
        }
    }

    async adicionarServicoCarrinho(idPessoa, idServico) {
        try {
            const body = { idPessoa, idServico };
            const response = await apiService.post(this.BASE_URL, body);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao adicionar item ao carrinho');
        }
    }

    async removerItemCarrinho(idCarrinho) {
        try {
            const response = await apiService.delete(`${this.BASE_URL}/${idCarrinho}`);
        } catch (error) {
            throw new Error(error.message || 'Erro ao remover item do carrinho');
        }
    }
}

export const carrinhoService = new CarrinhoService();
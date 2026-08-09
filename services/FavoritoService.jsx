import { apiService } from './ApiService';

export class FavoritoService {
    BASE_URL = '/favoritos';

    async buscarFavoritosUsuario(idPessoa) {
        try {
            const response = await apiService.get(`${this.BASE_URL}/pessoa/${idPessoa}`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao buscar favoritos do usuário');
        }
    }

    async adicionarServicoFavorito(idPessoa, idServico) {
        try {
            const body = { idPessoa, idServico };
            const response = await apiService.post(this.BASE_URL, body);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao adicionar item aos favoritos');
        }
    }

    async removerItemFavorito(idFavorito) {
        try {
            const response = await apiService.delete(`${this.BASE_URL}/${idFavorito}`);
        } catch (error) {
            throw new Error(error.message || 'Erro ao remover item dos favoritos');
        }
    }
}

export const favoritoService = new FavoritoService();
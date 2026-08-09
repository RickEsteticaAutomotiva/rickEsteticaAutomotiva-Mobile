import { apiService } from './ApiService';

export class VeiculoService {
    BASE_URL = '/veiculos';

    async buscarTodos(parametros = {}) {
        try {
            const {
                pagina,
                tamanho,
                ordenarPor,
                direcao,
                filtro
            } = parametros;

            const queryParams = new URLSearchParams();

            if (pagina !== undefined && pagina !== null) {
                queryParams.set('pagina', pagina.toString());
            }

            if (tamanho !== undefined && tamanho !== null) {
                queryParams.set('tamanho', tamanho.toString());
            }

            if (ordenarPor) {
                queryParams.set('ordenarPor', ordenarPor);
            }

            if (direcao) {
                queryParams.set('direcao', direcao);
            }

            if (filtro && filtro.trim()) {
                queryParams.set('filtro', filtro.trim());
            }

            const sufixoQuery = queryParams.toString();
            const endpoint = sufixoQuery ? `${this.BASE_URL}?${sufixoQuery}` : this.BASE_URL;
            const response = await apiService.get(endpoint);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao buscar veículos');
        }
    }

    async buscarPorId(idVeiculo) {
        try {
            const response = await apiService.get(`${this.BASE_URL}/${idVeiculo}`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao buscar veículo');
        }
    }

    async buscarVeiculosPorUsuario(idPessoa) {
        try {
            const response = await apiService.get(`${this.BASE_URL}/pessoa/${idPessoa}`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao buscar veículos do usuário');
        }
    }

    async adicionarVeiculo(veiculoData) {
        try {
            const response = await apiService.post(this.BASE_URL, veiculoData);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao adicionar veículo');
        }
    }

    async atualizarVeiculo(veiculoData) {
        try {
            const response = await apiService.patch(`${this.BASE_URL}/${veiculoData.id}`, veiculoData);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao atualizar veículo');
        }
    }

    async removerVeiculo(idVeiculo) {
        try {
            const response = await apiService.delete(`${this.BASE_URL}/${idVeiculo}`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao remover veículo');
        }
    }
}

export const veiculoService = new VeiculoService();
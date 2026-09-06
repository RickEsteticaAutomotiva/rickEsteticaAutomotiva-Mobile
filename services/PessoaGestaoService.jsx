import { apiService } from './ApiService';

export class PessoaGestaoService {
    BASE_URL = '/pessoas-gestao';

    async buscarPorFiltro(filtro, parametros = {}) {
        try {
            const { pagina = 0, tamanho = 20 } = parametros;

            const queryParams = new URLSearchParams();
            queryParams.set('pagina', pagina.toString());
            queryParams.set('tamanho', tamanho.toString());

            if (filtro && filtro.trim()) {
                queryParams.set('filtro', filtro.trim());
            }

            const response = await apiService.get(`${this.BASE_URL}?${queryParams.toString()}`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao buscar clientes');
        }
    }
}

export const pessoaGestaoService = new PessoaGestaoService();

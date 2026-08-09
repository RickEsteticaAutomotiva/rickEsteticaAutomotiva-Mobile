import { apiService } from './ApiService';

export class ServicosService {
    BASE_URL = '/servicos';

    async buscarTodos(parametros = {}) {
        try {
            const {
                pagina = 0,
                tamanho = 20,
                ordenarPor = 'nome',
                filtro = ''
            } = parametros;

            const queryParams = new URLSearchParams();
            queryParams.set('pagina', pagina.toString());
            queryParams.set('tamanho', tamanho.toString());
            queryParams.set('ordenarPor', ordenarPor);
            
            if (filtro && filtro.trim()) {
                queryParams.set('filtro', filtro);
            }

            const url = `${this.BASE_URL}?${queryParams.toString()}`;
            
            try {
                const response = await apiService.get(url);
                return response;
            } catch (error1) {
                console.warn('[ServicosService.buscarTodos] Erro com parâmetros, tentando endpoint simples:', error1?.message);
                const response = await apiService.get(this.BASE_URL);
                return response;
            }
        } catch (error) {
            console.error('[ServicosService.buscarTodos] Erro:', error);
            throw new Error(error.message || 'Erro ao buscar serviços');
        }
    }

    async buscarPorId(id) {
        try {
            const response = await apiService.get(`${this.BASE_URL}/${id}`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao buscar serviço');
        }
    }

    async buscarPorCategoria(categoria, parametros = {}) {
        try {
            const {
                pagina = 0,
                tamanho = 20,
                ordenarPor = 'nome'
            } = parametros;

            const queryParams = new URLSearchParams({
                pagina: pagina.toString(),
                tamanho: tamanho.toString(),
                ordenarPor,
                filtro: categoria
            });

            const response = await apiService.get(`${this.BASE_URL}?${queryParams.toString()}`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao buscar serviços por categoria');
        }
    }

    async pesquisar(termo, parametros = {}) {
        try {
            const {
                pagina = 0,
                tamanho = 20,
                ordenarPor = 'nome'
            } = parametros;

            const queryParams = new URLSearchParams({
                pagina: pagina.toString(),
                tamanho: tamanho.toString(),
                ordenarPor,
                filtro: termo
            });

            const response = await apiService.get(`${this.BASE_URL}?${queryParams.toString()}`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao pesquisar serviços');
        }
    }

    async criarServico(servicoData) {
        try {
            const response = await apiService.post(this.BASE_URL, servicoData);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao criar serviço');
        }
    }

    async atualizarServico(id, servicoData) {
        try {
            const response = await apiService.patch(`${this.BASE_URL}/${id}`, servicoData);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao atualizar serviço');
        }
    }

    async excluirServico(id) {
        try {
            const response = await apiService.delete(`${this.BASE_URL}/${id}`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao excluir serviço');
        }
    }

    async uploadImagemServico(servicoId, arquivo) {
        try {
            const response = await apiService.uploadFile(`${this.BASE_URL}/${servicoId}/imagem`, arquivo);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao fazer upload da imagem');
        }
    }
}

export const servicosService = new ServicosService();
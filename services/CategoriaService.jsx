import { apiService } from "./ApiService";

export class CategoriaService {
    BASE_URL = '/categorias';

    async buscarTodas() {
        try {
            const response = await apiService.get(this.BASE_URL);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao buscar categorias');
        }
    }

    async criarCategoria(categoria) {
        try {
            const response = await apiService.post(this.BASE_URL, categoria);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao criar categoria');
        }
    }

    async atualizarCategoria(id, categoria) {
        try {
            const response = await apiService.patch(`${this.BASE_URL}/${id}`, categoria);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao atualizar categoria');
        }
    }

    async deletarCategoria(id) {
        try {
            const response = await apiService.delete(`${this.BASE_URL}/${id}`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao deletar categoria');
        }
    }
}

export const categoriaService = new CategoriaService();

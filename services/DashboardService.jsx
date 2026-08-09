import { apiService } from './ApiService';

export class DashboardService {
    BASE_URL = 'dashboard';

    async buscarCancelamentos() {
        try {
            const response = await apiService.get(`${this.BASE_URL}/cancelamentos`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao buscar cancelamentos');
        }
    }

    async fluxoCaixa() {
        try {
            const response = await apiService.get(`${this.BASE_URL}/fluxo-caixa`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao buscar flux de caixa');
        }
    }

    async faturamentoPorServico() {
        try {
            const response = await apiService.get(`${this.BASE_URL}/faturamento-servicos`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao buscar faturamento por serviço');
        }
    }

    async totalOrdens() {
        try {
            const response = await apiService.get(`${this.BASE_URL}/total-ordens`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao buscar total de ordens');
        }
    }

    async ticketMedio() {
        try {
            const response = await apiService.get(`${this.BASE_URL}/ticket-medio`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao buscar ticket Medio');
        }
    }


    async servicosConcluidos() {
        try {
            const response = await apiService.get(`${this.BASE_URL}/servicos-concluidos`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao buscar servicos concluidos');
        }
    }

    async faturamento() {
        try {
            const response = await apiService.get(`${this.BASE_URL}/faturamento`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao buscar faturamento');
        }
    }

    async faturamentoPeriodo() {
        try {
            const response = await apiService.get(`${this.BASE_URL}/faturamento-periodo`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao buscar faturamento por periodo');
        }
    }

    async homeResumo() {
        try {
            const response = await apiService.get(`${this.BASE_URL}/home-resumo`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao buscar resumo da home');
        }
    }
    
}
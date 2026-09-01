import { apiService } from './ApiService';

export class AssistenteService {
    BASE_URL = '/assistente';

    async enviarMensagem(historico) {
        try {
            // Uma chamada ao Gemini pode passar dos 10s padrão do ApiService
            // (observado ~11s em um turno com tool-calling), então essa
            // chamada específica usa um timeout maior só para ela.
            const response = await apiService.post(
                `${this.BASE_URL}/mensagens`,
                { historico },
                { timeout: 30000 }
            );
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao conversar com o assistente');
        }
    }
}

export const assistenteService = new AssistenteService();

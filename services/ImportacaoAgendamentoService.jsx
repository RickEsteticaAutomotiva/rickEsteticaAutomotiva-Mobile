import { apiService } from './ApiService';

export class ImportacaoAgendamentoService {
    BASE_URL = '/ordem-servicos-gestao/importar-ia';

    async extrair(imagemBase64, mimeType) {
        try {
            // O Gemini multimodal pode demorar mais que o timeout padrão de
            // 10s do ApiService — mesmo padrão de timeout estendido usado no
            // AssistenteService.
            const response = await apiService.post(
                this.BASE_URL,
                { imagemBase64, mimeType },
                { timeout: 30000 }
            );
            return response;
        } catch (error) {
            throw new Error(error.message || 'Não foi possível processar a imagem agora. Tente novamente.');
        }
    }
}

export const importacaoAgendamentoService = new ImportacaoAgendamentoService();

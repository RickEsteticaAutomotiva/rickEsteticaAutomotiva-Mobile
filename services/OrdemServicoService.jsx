import { apiService } from './ApiService';

export class OrdemServicoService {
    BASE_URL = '/ordem-servicos';
    BASE_URL_GESTAO = '/ordem-servicos-gestao';

    STATUS_POR_ID = {
        1: 'ANÁLISE',
        2: 'AGENDA_CONFIRMADA',
        3: 'EM_EXECUÇÃO',
        4: 'CANCELADO',
        5: 'CONCLUÍDO'
    };

    ID_POR_STATUS = {
        ANALISE: 1,
        'ANÁLISE': 1,
        'AGENDA_CONFIRMADA': 2,
        'AGENDA CONFIRMADA': 2,
        EM_EXECUCAO: 3,
        'EM_EXECUÇÃO': 3,
        CANCELADO: 4,
        CONCLUIDO: 5,
        'CONCLUÍDO': 5,
        AGUARDANDO: 1,
        EM_ANDAMENTO: 2,
        AGUARDANDO_PECAS: 3
    };

    normalizarStatusParaBackend(status) {
        if (status === undefined || status === null || status === '') {
            return null;
        }

        if (typeof status === 'number') {
            return status;
        }

        if (typeof status === 'string') {
            const numeroStatus = Number(status);
            if (!Number.isNaN(numeroStatus)) {
                return numeroStatus;
            }

            return this.ID_POR_STATUS[status] ?? status;
        }

        return status;
    }

    async buscarAgendamentosHoje() {
        try {
            const response = await apiService.get(`${this.BASE_URL_GESTAO}/hoje`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao buscar agendamentos de hoje');
        }
    }

    async listarOrdensGestao(parametros = {}) {
        try {
            const {
                status,
                filtro,
                dataInicio,
                dataFim,
                pagina = 0,
                tamanho = 20,
                ordenarPor,
                direcao
            } = parametros;

            const queryParams = new URLSearchParams();
            queryParams.set('pagina', pagina.toString());
            queryParams.set('tamanho', tamanho.toString());

            if (status !== undefined && status !== null && status !== '') {
                queryParams.set('status', status.toString());
            }

            if (filtro && filtro.trim()) {
                queryParams.set('filtro', filtro.trim());
            }

            if (ordenarPor) {
                queryParams.set('ordenarPor', ordenarPor);
            }

            if (direcao) {
                queryParams.set('direcao', direcao);
            }

            if (dataInicio) {
                queryParams.set('dataInicio', dataInicio);
            }

            if (dataFim) {
                queryParams.set('dataFim', dataFim);
            }

            const response = await apiService.get(`${this.BASE_URL_GESTAO}?${queryParams.toString()}`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao buscar ordens de serviço para gestão');
        }
    }

    async buscarPorId(id) {
        try {
            const response = await apiService.get(`${this.BASE_URL_GESTAO}/${id}`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao buscar detalhes da ordem de serviço');
        }
    }

    async criarOrdemServico(ordemData) {
        try {
            const response = await apiService.post(this.BASE_URL, ordemData);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao criar ordem de serviço');
        }
    }

    async criarOrdemServicoGestao(ordemData) {
        const servicosNormalizados = Array.isArray(ordemData?.servicos)
            ? ordemData.servicos.map((servico) => Number(servico)).filter((id) => !Number.isNaN(id))
            : [];

        const veiculo = ordemData?.veiculo ?? ordemData?.veiculoId;
        const payload = {
            dataAgendamento: ordemData?.dataAgendamento,
            ...(veiculo !== undefined && veiculo !== null ? { veiculo: Number(veiculo) } : {}),
            servicos: servicosNormalizados,
            ...(ordemData?.precoMinimo !== undefined ? { precoMinimo: ordemData.precoMinimo } : {}),
            ...(ordemData?.observacoes ? { observacoes: ordemData.observacoes } : {})
        };

        try {
            const response = await apiService.post(this.BASE_URL_GESTAO, payload);
            return response;
        } catch (error) {
            console.error('[OrdemServicoService.criarOrdemServicoGestao] Falha ao criar ordem', {
                endpoint: this.BASE_URL_GESTAO,
                payload,
                mensagem: error?.message
            });
            throw new Error(error?.message || 'Erro ao criar ordem de serviço pela gestão');
        }
    }

    
    async buscarOrdemServicoPorUsuario(usuarioId) {
        try {
            const response = await apiService.get(`${this.BASE_URL}/usuario/${usuarioId}`);
            return response;
        }
        catch (error) {
            throw new Error(error.message || 'Erro ao buscar ordens de serviço do usuário');
        }
    }

    async buscarMinhasOrdens() {
        try {
            const response = await apiService.get(`${this.BASE_URL}/me`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao buscar ordens de serviço do usuário autenticado');
        }
    }

    async atualizarStatus(id, novoStatus, motivo = null, observacoes = '') {
        try {
            const payload = { status: novoStatus };
            
            // Se cancelando
            if (novoStatus === 4 && motivo) {
                // Apenas enviar motivo se não for "Outros" (id 4)
                // Para "Outros", enviamos apenas as observações
                if (motivo !== 4) {
                    payload.motivo = motivo;
                }
            }
            
            // Adicionar observações se fornecidas
            if (observacoes) {
                payload.observacoes = observacoes;
            }
            
            const response = await apiService.patch(`${this.BASE_URL}/${id}`, payload);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao atualizar status da ordem de serviço');
        }
    }

    async atualizarStatusGestao(id, novoStatus, motivoCancelamento) {
        try {
            const statusNormalizado = this.normalizarStatusParaBackend(novoStatus);
            const payload = { status: statusNormalizado };
            if (motivoCancelamento !== undefined && motivoCancelamento !== null && motivoCancelamento !== '') {
                payload.motivoCancelamento = motivoCancelamento;
            }
            const response = await apiService.patch(`${this.BASE_URL_GESTAO}/${id}`, payload);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao atualizar status da ordem de serviço');
        }
    }

    async cancelarOrdemGestao(id, motivoCancelamento) {
        try {
            // Envia o motivo no corpo usando a chave `motivo` conforme novo endpoint
            const payload = { motivo: motivoCancelamento };
            const response = await apiService.patch(`${this.BASE_URL_GESTAO}/${id}/cancel`, payload);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao cancelar a ordem de serviço');
        }
    }

    async atualizarDadosGestao(id, dadosOrdem = {}) {
        const statusNormalizado = this.normalizarStatusParaBackend(dadosOrdem?.status);

        const payload = {
            ...(dadosOrdem?.dataAgendamento ? { dataAgendamento: dadosOrdem.dataAgendamento } : {}),
            ...(dadosOrdem?.observacoes !== undefined ? { observacoes: dadosOrdem.observacoes } : {}),
            ...(statusNormalizado !== undefined && statusNormalizado !== null && statusNormalizado !== ''
                ? { status: statusNormalizado }
                : {})
        };

        if (Object.keys(payload).length === 0) {
            throw new Error('Nenhum dado válido foi informado para atualização da ordem.');
        }

        try {
            const response = await apiService.patch(`${this.BASE_URL_GESTAO}/${id}`, payload);
            const resultado = response?.data ?? response;
            return resultado;
        } catch (error) {
            throw new Error(error.message || 'Erro ao atualizar dados da ordem de serviço');
        }
    }

    async adicionarServicos(id, servicos) {
        const payloadServicos = (servicos || [])
            .map((servico) => {
                const idServico = servico?.idServico ?? servico?.id;
                const valorAplicado = servico?.valorAplicado ?? servico?.preco;

                if (idServico === undefined || idServico === null) {
                    return null;
                }

                return {
                    idServico,
                    ...(typeof valorAplicado === 'number' ? { valorAplicado } : {})
                };
            })
            .filter(Boolean);

        if (payloadServicos.length === 0) {
            throw new Error('Nenhum serviço válido foi informado para adição.');
        }

        try {
            const endpoint = `${this.BASE_URL_GESTAO}/${id}/servicos`;
            const body = { servicos: payloadServicos };
            await apiService.post(endpoint, body);
            const response = await apiService.get(`${this.BASE_URL_GESTAO}/${id}`);
            return response;
        } catch (error) {
            console.error('[OrdemServicoService.adicionarServicos] Erro:', error);
            throw new Error(error.message || 'Erro ao adicionar serviços na ordem de serviço');
        }
    }

    async atualizarServicoDaOrdem(id, servicoId, servicoData) {
        const endpoint = `${this.BASE_URL_GESTAO}/${id}/servicos/${servicoId}`;
        const valor = servicoData?.valorAplicado ?? servicoData?.valor ?? servicoData?.preco;

        const tentativasPayload = [
            servicoData,
            { valorAplicado: valor },
            { valor },
            { preco: valor }
        ].filter((payload) => payload && Object.values(payload).every((item) => item !== undefined));

        let ultimoErro = null;

        for (const payload of tentativasPayload) {
            try {
                const response = await apiService.patch(endpoint, payload);
                return response;
            } catch (error) {
                ultimoErro = error;
            }
        }

        throw new Error(ultimoErro?.message || 'Erro ao atualizar serviço da ordem de serviço');
    }

    async removerServicoDaOrdem(id, servicoId) {
        try {
            await apiService.delete(`${this.BASE_URL_GESTAO}/${id}/servicos/${servicoId}`);
            const response = await apiService.get(`${this.BASE_URL_GESTAO}/${id}`);
            return response;
        } catch (error) {
            throw new Error(error.message || 'Erro ao remover serviço da ordem de serviço');
        }
    }

    async buscarHorariosDisponiveis(data, servicosIds = []) {
        try {
            // Formatar data como YYYY-MM-DD
            const dataFormatada = data instanceof Date
                ? data.toISOString().split('T')[0]
                : data;

            const queryParams = new URLSearchParams();
            queryParams.set('data', dataFormatada);

            // Adicionar IDs dos serviços como parâmetros múltiplos
            servicosIds.forEach(id => {
                queryParams.append('servicosIds', id);
            });

            const response = await apiService.get(`${this.BASE_URL}/horarios-disponiveis?${queryParams.toString()}`);
            return response || [];
        } catch (error) {
            console.error('[OrdemServicoService.buscarHorariosDisponiveis] Erro:', error);
            throw new Error(error.message || 'Erro ao buscar horários disponíveis');
        }
    }
}

export const ordemServicoService = new OrdemServicoService();

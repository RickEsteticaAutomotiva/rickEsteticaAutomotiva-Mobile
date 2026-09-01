import { useCallback, useEffect, useState } from 'react';
import { ordemServicoService } from '../services/OrdemServicoService';
import { normalizarOrdemServico } from '../utils/normalizacao';
import { STATUS_CANCELADO } from '../constants/statusOrdemServico';
import type { OrdemServico } from '../types';

export function useOrdemServicoDetalhe(
  ordemResumo: OrdemServico,
  onOrdemAtualizada?: (ordem: OrdemServico) => void
) {
  const [ordem, setOrdem] = useState<OrdemServico>(ordemResumo);
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(true);
  const [erroDetalhe, setErroDetalhe] = useState<string | null>(null);

  const [alterandoStatus, setAlterandoStatus] = useState(false);
  const [erroStatus, setErroStatus] = useState<string | null>(null);

  const [motivoCancelamento, setMotivoCancelamento] = useState<number | null>(null);
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false);
  const [salvandoCancelamento, setSalvandoCancelamento] = useState(false);
  const [erroCancelamento, setErroCancelamento] = useState<string | null>(null);

  const [modalAdicionarVisible, setModalAdicionarVisible] = useState(false);
  const [adicionandoServicos, setAdicionandoServicos] = useState(false);
  const [erroAdicionarServicos, setErroAdicionarServicos] = useState<string | null>(null);

  const [servicoEditandoValor, setServicoEditandoValor] = useState<{ id: string | number; nome: string } | null>(
    null
  );
  const [salvandoValorServico, setSalvandoValorServico] = useState(false);
  const [erroValorServico, setErroValorServico] = useState<string | null>(null);

  const [servicoRemovendo, setServicoRemovendo] = useState<{ id: string | number; nome: string } | null>(null);
  const [removendoServico, setRemovendoServico] = useState(false);
  const [erroRemoverServico, setErroRemoverServico] = useState<string | null>(null);

  const [salvandoDados, setSalvandoDados] = useState(false);
  const [erroSalvarDados, setErroSalvarDados] = useState<string | null>(null);

  function aplicarOrdemAtualizada(resposta: unknown) {
    const atualizada = normalizarOrdemServico(resposta);
    if (atualizada) {
      setOrdem(atualizada);
      onOrdemAtualizada?.(atualizada);
    }
    return atualizada;
  }

  useEffect(() => {
    let cancelado = false;

    setCarregandoDetalhe(true);
    setErroDetalhe(null);

    ordemServicoService
      .buscarPorId(ordemResumo.id)
      .then((resposta: unknown) => {
        if (cancelado) return;
        const detalhe = normalizarOrdemServico(resposta);
        if (detalhe) {
          setOrdem(detalhe);
        }
      })
      .catch((error: unknown) => {
        if (cancelado) return;
        setErroDetalhe(error instanceof Error ? error.message : 'Não foi possível carregar os detalhes.');
      })
      .finally(() => {
        if (!cancelado) setCarregandoDetalhe(false);
      });

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordemResumo.id]);

  const alterarStatus = useCallback(
    async (novoStatusId: number) => {
      if (alterandoStatus) return;

      if (novoStatusId === STATUS_CANCELADO) {
        setConfirmandoCancelamento(true);
        setErroCancelamento(null);
        return;
      }

      setAlterandoStatus(true);
      setErroStatus(null);

      try {
        const resposta = await ordemServicoService.atualizarStatusGestao(ordem.id, novoStatusId);
        aplicarOrdemAtualizada(resposta);
      } catch (error) {
        setErroStatus(error instanceof Error ? error.message : 'Não foi possível atualizar o status.');
      } finally {
        setAlterandoStatus(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [alterandoStatus, ordem.id]
  );

  function cancelarFluxoCancelamento() {
    if (salvandoCancelamento) return;
    setConfirmandoCancelamento(false);
    setMotivoCancelamento(null);
    setErroCancelamento(null);
  }

  async function confirmarCancelamento() {
    if (salvandoCancelamento || motivoCancelamento === null) return;

    setSalvandoCancelamento(true);
    setErroCancelamento(null);

    try {
      const resposta = await ordemServicoService.cancelarOrdemGestao(ordem.id, motivoCancelamento);
      aplicarOrdemAtualizada(resposta);
      setConfirmandoCancelamento(false);
      setMotivoCancelamento(null);
    } catch (error) {
      setErroCancelamento(error instanceof Error ? error.message : 'Não foi possível cancelar a ordem.');
    } finally {
      setSalvandoCancelamento(false);
    }
  }

  async function adicionarServicos(servicosIds: Array<string | number>) {
    if (adicionandoServicos || servicosIds.length === 0) return;

    setAdicionandoServicos(true);
    setErroAdicionarServicos(null);

    try {
      const resposta = await ordemServicoService.adicionarServicos(
        ordem.id,
        servicosIds.map((idServico) => ({ idServico }))
      );
      aplicarOrdemAtualizada(resposta);
      setModalAdicionarVisible(false);
    } catch (error) {
      setErroAdicionarServicos(error instanceof Error ? error.message : 'Não foi possível adicionar os serviços.');
    } finally {
      setAdicionandoServicos(false);
    }
  }

  async function salvarValorServico(novoValor: number) {
    if (!servicoEditandoValor || salvandoValorServico) return;

    setSalvandoValorServico(true);
    setErroValorServico(null);

    try {
      const resposta = await ordemServicoService.atualizarServicoDaOrdem(ordem.id, servicoEditandoValor.id, {
        valorAplicado: novoValor,
      });
      aplicarOrdemAtualizada(resposta);
      setServicoEditandoValor(null);
    } catch (error) {
      setErroValorServico(error instanceof Error ? error.message : 'Não foi possível atualizar o valor do serviço.');
    } finally {
      setSalvandoValorServico(false);
    }
  }

  async function confirmarRemocaoServico() {
    if (!servicoRemovendo || removendoServico) return;

    setRemovendoServico(true);
    setErroRemoverServico(null);

    try {
      const resposta = await ordemServicoService.removerServicoDaOrdem(ordem.id, servicoRemovendo.id);
      aplicarOrdemAtualizada(resposta);
      setServicoRemovendo(null);
    } catch (error) {
      setErroRemoverServico(error instanceof Error ? error.message : 'Não foi possível remover o serviço.');
    } finally {
      setRemovendoServico(false);
    }
  }

  async function salvarDados(dados: { dataAgendamento: string; observacoes: string }) {
    if (salvandoDados) return;

    setSalvandoDados(true);
    setErroSalvarDados(null);

    try {
      const resposta = await ordemServicoService.atualizarDadosGestao(ordem.id, {
        dataAgendamento: dados.dataAgendamento,
        observacoes: dados.observacoes,
        status: ordem.status.id,
      });
      aplicarOrdemAtualizada(resposta);
      return true;
    } catch (error) {
      setErroSalvarDados(error instanceof Error ? error.message : 'Não foi possível salvar as alterações.');
      return false;
    } finally {
      setSalvandoDados(false);
    }
  }

  return {
    ordem,
    carregandoDetalhe,
    erroDetalhe,
    alterandoStatus,
    erroStatus,
    alterarStatus,
    confirmandoCancelamento,
    motivoCancelamento,
    setMotivoCancelamento,
    salvandoCancelamento,
    erroCancelamento,
    confirmarCancelamento,
    cancelarFluxoCancelamento,
    modalAdicionarVisible,
    setModalAdicionarVisible,
    adicionandoServicos,
    erroAdicionarServicos,
    adicionarServicos,
    servicoEditandoValor,
    setServicoEditandoValor,
    salvandoValorServico,
    erroValorServico,
    salvarValorServico,
    servicoRemovendo,
    setServicoRemovendo,
    removendoServico,
    erroRemoverServico,
    confirmarRemocaoServico,
    salvandoDados,
    erroSalvarDados,
    salvarDados,
  };
}

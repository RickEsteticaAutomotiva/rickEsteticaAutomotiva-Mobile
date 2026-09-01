import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { categoriaService } from '../services/CategoriaService';
import { servicosService } from '../services/ServicosService';
import { normalizarCategorias, normalizarServicos } from '../utils/normalizacao';
import type { Categoria, Servico } from '../types';

export type DadosServicoForm = {
  nome: string;
  descricao: string;
  preco: string;
  categoriaId: string | number | null;
  duracaoMinutos: string;
};

// duracaoHoras e categoriaId são @NotNull no backend (ServicoRequest) —
// sempre inclusos aqui, nunca condicionais.
function montarPayload(dados: DadosServicoForm) {
  const minutos = Number(dados.duracaoMinutos);
  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;

  return {
    nome: dados.nome.trim(),
    descricao: dados.descricao.trim(),
    preco: Number(dados.preco.replace(',', '.')),
    categoriaId: dados.categoriaId,
    duracaoHoras: `${String(horas).padStart(2, '0')}:${String(minutosRestantes).padStart(2, '0')}:00`,
  };
}

export function useServicosGerente() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [modalFormVisible, setModalFormVisible] = useState(false);
  const [servicoEditando, setServicoEditando] = useState<Servico | null>(null);
  const [salvandoForm, setSalvandoForm] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  const [servicoRemovendo, setServicoRemovendo] = useState<Servico | null>(null);
  const [removendo, setRemovendo] = useState(false);
  const [erroRemocao, setErroRemocao] = useState<string | null>(null);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setErro(null);

    try {
      const [respostaServicos, respostaCategorias] = await Promise.all([
        servicosService.buscarTodos({ pagina: 0, tamanho: 100, ordenarPor: 'nome' }),
        categoriaService.buscarTodas(),
      ]);
      setServicos(normalizarServicos(respostaServicos));
      setCategorias(normalizarCategorias(respostaCategorias));
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Não foi possível carregar os serviços.';
      setErro(mensagem);
      setServicos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados])
  );

  function abrirAdicao() {
    setServicoEditando(null);
    setErroForm(null);
    setModalFormVisible(true);
  }

  function abrirEdicao(servico: Servico) {
    setServicoEditando(servico);
    setErroForm(null);
    setModalFormVisible(true);
  }

  function fecharForm() {
    if (salvandoForm) {
      return;
    }
    setModalFormVisible(false);
  }

  async function handleSubmitForm(dados: DadosServicoForm) {
    if (salvandoForm) {
      return;
    }

    setSalvandoForm(true);
    setErroForm(null);

    try {
      const payload = montarPayload(dados);

      if (servicoEditando) {
        await servicosService.atualizarServico(servicoEditando.id, payload);
      } else {
        await servicosService.criarServico(payload);
      }

      setModalFormVisible(false);
      setServicoEditando(null);
      await carregarDados();
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : servicoEditando
            ? 'Não foi possível salvar as alterações do serviço.'
            : 'Não foi possível criar o serviço.';
      setErroForm(mensagem);
    } finally {
      setSalvandoForm(false);
    }
  }

  function abrirConfirmacaoRemocao(servico: Servico) {
    setServicoRemovendo(servico);
    setErroRemocao(null);
  }

  function fecharConfirmacaoRemocao() {
    if (removendo) {
      return;
    }
    setServicoRemovendo(null);
  }

  async function handleConfirmarRemocao() {
    if (!servicoRemovendo || removendo) {
      return;
    }

    setRemovendo(true);
    setErroRemocao(null);

    try {
      await servicosService.excluirServico(servicoRemovendo.id);
      setServicos((atual) => atual.filter((servico) => servico.id !== servicoRemovendo.id));
      setServicoRemovendo(null);
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível remover este serviço. Tente novamente.';
      setErroRemocao(mensagem);
    } finally {
      setRemovendo(false);
    }
  }

  return {
    servicos,
    categorias,
    loading,
    erro,
    carregarDados,
    modalFormVisible,
    servicoEditando,
    salvandoForm,
    erroForm,
    abrirAdicao,
    abrirEdicao,
    fecharForm,
    handleSubmitForm,
    servicoRemovendo,
    removendo,
    erroRemocao,
    abrirConfirmacaoRemocao,
    fecharConfirmacaoRemocao,
    handleConfirmarRemocao,
  };
}

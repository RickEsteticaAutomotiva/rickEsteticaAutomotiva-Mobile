import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { veiculoService } from '../services/VeiculoService';
import { normalizarVeiculo, normalizarVeiculos } from '../utils/normalizacao';
import type { Veiculo } from '../types';

export type DadosVeiculoForm = {
  marca: string;
  modelo: string;
  ano: string;
  cor: string;
  placa: string;
  porte: string;
};

type OpcoesUseVeiculos = {
  onVeiculoAdicionado?: (veiculo: Veiculo) => void;
  onVeiculoRemovido?: (idVeiculo: string | number) => void;
};

// Lógica de CRUD de veículos compartilhada entre a tela de seleção de veículo
// no fluxo de agendamento (`app/veiculo.tsx`) e a tela de gerenciamento em
// Configurações (`app/veiculos.tsx`), para as duas usarem exatamente os
// mesmos services/estado em vez de duas implementações divergentes.
export function useVeiculos(opcoes: OpcoesUseVeiculos = {}) {
  const { onVeiculoAdicionado, onVeiculoRemovido } = opcoes;
  const { user } = useAuth();

  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [modalFormVisible, setModalFormVisible] = useState(false);
  const [veiculoEditando, setVeiculoEditando] = useState<Veiculo | null>(null);
  const [salvandoForm, setSalvandoForm] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  const [veiculoRemovendo, setVeiculoRemovendo] = useState<Veiculo | null>(null);
  const [removendo, setRemovendo] = useState(false);
  const [erroRemocao, setErroRemocao] = useState<string | null>(null);

  const carregarVeiculos = useCallback(async () => {
    if (!user?.id) {
      setVeiculos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      const response = await veiculoService.buscarVeiculosPorUsuario(user.id);
      setVeiculos(normalizarVeiculos(response));
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível carregar seus veículos.';
      setErro(mensagem);
      setVeiculos([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      carregarVeiculos();
    }, [carregarVeiculos])
  );

  function abrirAdicao() {
    setVeiculoEditando(null);
    setErroForm(null);
    setModalFormVisible(true);
  }

  function abrirEdicao(veiculo: Veiculo) {
    setVeiculoEditando(veiculo);
    setErroForm(null);
    setModalFormVisible(true);
  }

  function fecharForm() {
    if (salvandoForm) {
      return;
    }
    setModalFormVisible(false);
  }

  async function handleSubmitForm(dados: DadosVeiculoForm) {
    if (salvandoForm || !user?.id) {
      return;
    }

    setSalvandoForm(true);
    setErroForm(null);

    try {
      if (veiculoEditando) {
        await veiculoService.atualizarVeiculo({ id: veiculoEditando.id, ...dados });
        setVeiculos((atual) =>
          atual.map((veiculo) =>
            veiculo.id === veiculoEditando.id ? { ...veiculo, ...dados } : veiculo
          )
        );
      } else {
        const criado = await veiculoService.adicionarVeiculo({ idPessoa: user.id, ...dados });
        const novoVeiculo = normalizarVeiculo(criado);

        if (novoVeiculo) {
          setVeiculos((atual) => [...atual, novoVeiculo]);
          onVeiculoAdicionado?.(novoVeiculo);
        }
      }

      setModalFormVisible(false);
      setVeiculoEditando(null);
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : veiculoEditando
            ? 'Não foi possível salvar as alterações do veículo.'
            : 'Não foi possível adicionar o veículo.';
      setErroForm(mensagem);
    } finally {
      setSalvandoForm(false);
    }
  }

  function abrirConfirmacaoRemocao(veiculo: Veiculo) {
    setVeiculoRemovendo(veiculo);
    setErroRemocao(null);
  }

  function fecharConfirmacaoRemocao() {
    if (removendo) {
      return;
    }
    setVeiculoRemovendo(null);
  }

  async function handleConfirmarRemocao() {
    if (!veiculoRemovendo || removendo) {
      return;
    }

    setRemovendo(true);
    setErroRemocao(null);

    try {
      await veiculoService.removerVeiculo(veiculoRemovendo.id);
      setVeiculos((atual) => atual.filter((veiculo) => veiculo.id !== veiculoRemovendo.id));
      onVeiculoRemovido?.(veiculoRemovendo.id);
      setVeiculoRemovendo(null);
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível remover este veículo. Tente novamente.';
      setErroRemocao(mensagem);
    } finally {
      setRemovendo(false);
    }
  }

  return {
    veiculos,
    loading,
    erro,
    carregarVeiculos,
    modalFormVisible,
    veiculoEditando,
    salvandoForm,
    erroForm,
    abrirAdicao,
    abrirEdicao,
    fecharForm,
    handleSubmitForm,
    veiculoRemovendo,
    removendo,
    erroRemocao,
    abrirConfirmacaoRemocao,
    fecharConfirmacaoRemocao,
    handleConfirmarRemocao,
  };
}

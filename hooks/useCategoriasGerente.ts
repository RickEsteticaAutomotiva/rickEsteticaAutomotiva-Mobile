import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { categoriaService } from '../services/CategoriaService';
import { normalizarCategorias } from '../utils/normalizacao';
import type { Categoria } from '../types';

export type DadosCategoriaForm = {
  nome: string;
};

export function useCategoriasGerente() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [modalFormVisible, setModalFormVisible] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [salvandoForm, setSalvandoForm] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  const [categoriaRemovendo, setCategoriaRemovendo] = useState<Categoria | null>(null);
  const [removendo, setRemovendo] = useState(false);
  const [erroRemocao, setErroRemocao] = useState<string | null>(null);

  const carregarCategorias = useCallback(async () => {
    setLoading(true);
    setErro(null);

    try {
      const response = await categoriaService.buscarTodas();
      setCategorias(normalizarCategorias(response));
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Não foi possível carregar as categorias.';
      setErro(mensagem);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarCategorias();
    }, [carregarCategorias])
  );

  function abrirAdicao() {
    setCategoriaEditando(null);
    setErroForm(null);
    setModalFormVisible(true);
  }

  function abrirEdicao(categoria: Categoria) {
    setCategoriaEditando(categoria);
    setErroForm(null);
    setModalFormVisible(true);
  }

  function fecharForm() {
    if (salvandoForm) {
      return;
    }
    setModalFormVisible(false);
  }

  async function handleSubmitForm(dados: DadosCategoriaForm) {
    if (salvandoForm) {
      return;
    }

    setSalvandoForm(true);
    setErroForm(null);

    try {
      if (categoriaEditando) {
        await categoriaService.atualizarCategoria(categoriaEditando.id, dados);
        setCategorias((atual) =>
          atual.map((categoria) =>
            categoria.id === categoriaEditando.id ? { ...categoria, ...dados } : categoria
          )
        );
      } else {
        const criada = (await categoriaService.criarCategoria(dados)) as Partial<Categoria>;
        const novaCategoria: Categoria = {
          id: criada?.id ?? Date.now(),
          nome: dados.nome,
        };
        setCategorias((atual) => [...atual, novaCategoria]);
      }

      setModalFormVisible(false);
      setCategoriaEditando(null);
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : categoriaEditando
            ? 'Não foi possível salvar as alterações da categoria.'
            : 'Não foi possível criar a categoria.';
      setErroForm(mensagem);
    } finally {
      setSalvandoForm(false);
    }
  }

  function abrirConfirmacaoRemocao(categoria: Categoria) {
    setCategoriaRemovendo(categoria);
    setErroRemocao(null);
  }

  function fecharConfirmacaoRemocao() {
    if (removendo) {
      return;
    }
    setCategoriaRemovendo(null);
  }

  async function handleConfirmarRemocao() {
    if (!categoriaRemovendo || removendo) {
      return;
    }

    setRemovendo(true);
    setErroRemocao(null);

    try {
      await categoriaService.deletarCategoria(categoriaRemovendo.id);
      setCategorias((atual) => atual.filter((categoria) => categoria.id !== categoriaRemovendo.id));
      setCategoriaRemovendo(null);
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível remover esta categoria. Tente novamente.';
      setErroRemocao(mensagem);
    } finally {
      setRemovendo(false);
    }
  }

  return {
    categorias,
    loading,
    erro,
    carregarCategorias,
    modalFormVisible,
    categoriaEditando,
    salvandoForm,
    erroForm,
    abrirAdicao,
    abrirEdicao,
    fecharForm,
    handleSubmitForm,
    categoriaRemovendo,
    removendo,
    erroRemocao,
    abrirConfirmacaoRemocao,
    fecharConfirmacaoRemocao,
    handleConfirmarRemocao,
  };
}

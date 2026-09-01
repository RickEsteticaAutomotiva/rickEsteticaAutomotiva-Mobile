import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import type { DadosServicoForm } from '../../hooks/useServicosGerente';
import type { Categoria, Servico } from '../../types';
import { Alerta } from '../Alerta';
import { Button } from '../Button';
import { CampoTexto } from '../CampoTexto';

type ModalServicoProps = {
  visible: boolean;
  servico?: Servico | null;
  categorias: Categoria[];
  loading?: boolean;
  erro?: string | null;
  onClose: () => void;
  onSubmit: (dados: DadosServicoForm) => void;
};

const FORM_VAZIO: DadosServicoForm = {
  nome: '',
  descricao: '',
  preco: '',
  categoriaId: null,
  duracaoMinutos: '',
};

export function ModalServico({
  visible,
  servico = null,
  categorias,
  loading = false,
  erro = null,
  onClose,
  onSubmit,
}: ModalServicoProps) {
  const [dados, setDados] = useState<DadosServicoForm>(FORM_VAZIO);
  const [errosCampos, setErrosCampos] = useState<Record<string, string>>({});

  const emEdicao = servico !== null;

  useEffect(() => {
    if (visible) {
      setDados(
        servico
          ? {
              nome: servico.nome || '',
              descricao: servico.descricao || '',
              preco: servico.preco != null ? String(servico.preco) : '',
              categoriaId: servico.categoriaId ?? null,
              duracaoMinutos: servico.duracaoMinutos != null ? String(servico.duracaoMinutos) : '',
            }
          : FORM_VAZIO
      );
      setErrosCampos({});
    }
  }, [visible, servico]);

  function atualizarCampo<K extends keyof DadosServicoForm>(campo: K, valor: DadosServicoForm[K]) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
  }

  function validar() {
    const erros: Record<string, string> = {};

    const nomeAparado = dados.nome.trim();
    if (nomeAparado.length < 3 || nomeAparado.length > 50) {
      erros.nome = 'Nome deve ter entre 3 e 50 caracteres';
    }

    if (dados.descricao.length > 255) {
      erros.descricao = 'Descrição deve ter no máximo 255 caracteres';
    }

    const preco = Number(dados.preco.replace(',', '.'));
    if (!dados.preco || Number.isNaN(preco) || preco < 0) {
      erros.preco = 'Informe um preço válido';
    }

    if (dados.categoriaId === null) {
      erros.categoriaId = 'Selecione uma categoria';
    }

    const minutos = Number(dados.duracaoMinutos);
    if (!dados.duracaoMinutos || Number.isNaN(minutos) || minutos <= 0) {
      erros.duracaoMinutos = 'Informe a duração em minutos';
    }

    setErrosCampos(erros);
    return Object.keys(erros).length === 0;
  }

  function handleSalvar() {
    if (loading || !validar()) {
      return;
    }
    onSubmit(dados);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="max-h-[90%] w-full rounded-lg bg-white p-5 shadow">
          <Text className="text-xl font-bold text-gray-900">
            {emEdicao ? 'Editar serviço' : 'Novo serviço'}
          </Text>

          <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
            {erro ? <Alerta tipo="erro" mensagem={erro} /> : null}

            <CampoTexto
              label="Nome"
              placeholder="Ex: Lavagem Técnica Carro M"
              value={dados.nome}
              onChangeText={(texto) => atualizarCampo('nome', texto)}
              editable={!loading}
              error={errosCampos.nome}
              semMargemSuperior
            />

            <CampoTexto
              label="Descrição"
              placeholder="Descreva o serviço"
              value={dados.descricao}
              onChangeText={(texto) => atualizarCampo('descricao', texto)}
              editable={!loading}
              error={errosCampos.descricao}
              multiline
              numberOfLines={3}
            />

            <CampoTexto
              label="Preço (R$)"
              placeholder="Ex: 80,00"
              value={dados.preco}
              onChangeText={(texto) => atualizarCampo('preco', texto)}
              keyboardType="decimal-pad"
              editable={!loading}
              error={errosCampos.preco}
            />

            <CampoTexto
              label="Duração (minutos)"
              placeholder="Ex: 60"
              value={dados.duracaoMinutos}
              onChangeText={(texto) => atualizarCampo('duracaoMinutos', texto)}
              keyboardType="numeric"
              editable={!loading}
              error={errosCampos.duracaoMinutos}
            />

            <Text className="mb-2 mt-4 text-base font-semibold text-gray-900">Categoria</Text>
            {errosCampos.categoriaId ? (
              <Text className="mb-2 text-sm text-red-600">{errosCampos.categoriaId}</Text>
            ) : null}
            <View className="flex-row flex-wrap gap-2">
              {categorias.map((categoria) => {
                const selecionada = dados.categoriaId === categoria.id;
                return (
                  <Pressable
                    key={categoria.id}
                    onPress={() => atualizarCampo('categoriaId', categoria.id)}
                    disabled={loading}
                    className="rounded-full border px-4 py-2"
                    style={{
                      borderColor: selecionada ? '#B30000' : '#d1d5db',
                      backgroundColor: selecionada ? '#FEF2F2' : '#FFFFFF',
                    }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: selecionada ? '#B30000' : '#374151' }}
                    >
                      {categoria.nome}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View className="mt-5 flex-row gap-3">
            <Pressable
              className="h-14 flex-1 items-center justify-center rounded-lg border border-gray-300 active:opacity-70"
              onPress={onClose}
              disabled={loading}
            >
              <Text className="text-lg font-semibold text-gray-700">Cancelar</Text>
            </Pressable>

            <Button
              texto={emEdicao ? 'Salvar' : 'Adicionar'}
              onClick={handleSalvar}
              loading={loading}
              className="flex-1 bg-red-700"
              textClassName="text-white"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

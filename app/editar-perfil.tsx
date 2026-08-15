import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Alerta } from '@/components/Alerta';
import { Button } from '@/components/Button';
import { CampoTexto } from '@/components/CampoTexto';
import { EstadoCarregamento } from '@/components/EstadoCarregamento';
import { EstadoErro } from '@/components/EstadoErro';
import { InfoLinha } from '@/components/InfoLinha';
import { useAuth } from '@/context/AuthContext';
import { usuarioService } from '@/services/UsuarioService';
import { formatarDataSimples } from '@/utils';
import { normalizarPerfil } from '@/utils/normalizacao';
import { isEmailValido } from '@/utils/validacao/emailValidacao';
import type { Perfil } from '@/types';

export default function EditarPerfil() {
  const { user, updateUser } = useAuth();

  const [perfilBruto, setPerfilBruto] = useState<Record<string, unknown> | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [errosCampos, setErrosCampos] = useState<{ nome?: string; email?: string }>({});

  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const carregarPerfil = useCallback(async () => {
    if (!user?.id) {
      setCarregando(false);
      return;
    }

    setErroCarregamento(null);

    try {
      const response = await usuarioService.obterPerfil(user.id);
      const perfilCarregado = normalizarPerfil(response);

      setPerfilBruto((response ?? {}) as unknown as Record<string, unknown>);
      setPerfil(perfilCarregado);
      setNome(perfilCarregado?.nome ?? '');
      setEmail(perfilCarregado?.email ?? '');
      setTelefone(perfilCarregado?.telefone ?? '');
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível carregar seus dados.';
      setErroCarregamento(mensagem);
    } finally {
      setCarregando(false);
    }
  }, [user?.id]);

  useEffect(() => {
    carregarPerfil();
  }, [carregarPerfil]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function validarCampos() {
    const erros: { nome?: string; email?: string } = {};

    if (!nome.trim()) {
      erros.nome = 'Nome é obrigatório';
    }

    if (!email.trim()) {
      erros.email = 'E-mail é obrigatório';
    } else if (!isEmailValido(email)) {
      erros.email = 'Informe um e-mail válido';
    }

    setErrosCampos(erros);
    return Object.keys(erros).length === 0;
  }

  async function handleSalvar() {
    if (salvando || !user?.id) {
      return;
    }

    setErroSalvar(null);
    setSucesso(false);

    if (!validarCampos()) {
      return;
    }

    setSalvando(true);

    try {
      // O backend expõe PUT (substitui o recurso inteiro), então mesclamos os
      // dados já carregados com os campos editados em vez de enviar um objeto
      // parcial, para não apagar campos que esta tela não edita (cpf, roles, etc).
      const payload = {
        ...(perfilBruto ?? {}),
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim() || undefined,
      };

      await usuarioService.atualizarPerfil(user.id, payload);
      await updateUser({ nome: nome.trim(), email: email.trim() });

      setSucesso(true);
      timeoutRef.current = setTimeout(() => router.back(), 900);
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível salvar suas alterações.';
      setErroSalvar(mensagem);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <EstadoCarregamento mensagem="Carregando seus dados..." />;
  }

  if (erroCarregamento) {
    return (
      <EstadoErro
        mensagem={erroCarregamento}
        acaoTexto="Tentar novamente"
        onAcao={carregarPerfil}
      />
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 20 }}>
      {erroSalvar ? <Alerta tipo="erro" mensagem={erroSalvar} /> : null}
      {sucesso ? <Alerta tipo="sucesso" mensagem="Dados atualizados com sucesso!" /> : null}

      <CampoTexto
        label="Nome"
        placeholder="Seu nome completo"
        value={nome}
        onChangeText={setNome}
        editable={!salvando}
        error={errosCampos.nome}
        semMargemSuperior
      />

      <CampoTexto
        label="E-mail"
        placeholder="seu@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!salvando}
        error={errosCampos.email}
      />

      <CampoTexto
        label="Telefone"
        placeholder="(00) 00000-0000"
        value={telefone}
        onChangeText={setTelefone}
        keyboardType="phone-pad"
        editable={!salvando}
      />

      <Button
        texto="Salvar alterações"
        onClick={handleSalvar}
        loading={salvando}
        className="mt-6 bg-red-700"
        textClassName="text-white"
      />

      <Text className="mb-2 mt-6 text-xs font-semibold uppercase text-gray-400">
        Meus dados
      </Text>

      <View className="rounded-xl border border-gray-200 bg-white">
        <InfoLinha icone="card-outline" label="CPF" valor={perfil?.cpf} />
        <InfoLinha
          icone="calendar-outline"
          label="Data de nascimento"
          valor={perfil?.dataNascimento ? formatarDataSimples(perfil.dataNascimento) : undefined}
          ultimo
        />
      </View>
    </ScrollView>
  );
}

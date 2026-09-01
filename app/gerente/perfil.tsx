import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alerta } from '@/components/Alerta';
import { Button } from '@/components/Button';
import { CampoTexto } from '@/components/CampoTexto';
import { EstadoCarregamento } from '@/components/EstadoCarregamento';
import { EstadoErro } from '@/components/EstadoErro';
import { InfoLinha } from '@/components/InfoLinha';
import { useAuth } from '../../context/AuthContext';
import { usuarioService } from '../../services/UsuarioService';
import { formatarDataSimples } from '../../utils';
import { normalizarPerfil } from '../../utils/normalizacao';
import { isEmailValido } from '../../utils/validacao/emailValidacao';
import { validarSenhaForte } from '../../utils/validacao/senhaValidacao';
import type { Perfil } from '../../types';

const ROTULOS_ROLE: Record<string, string> = {
  ROLE_ADMIN: 'Administrador',
  ROLE_GERENTE: 'Gerente',
  ROLE_CLIENTE: 'Cliente',
};

export default function PerfilGerente() {
  const { user, updateUser } = useAuth();

  const [perfilBruto, setPerfilBruto] = useState<Record<string, unknown> | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [errosDados, setErrosDados] = useState<{ nome?: string; email?: string }>({});
  const [salvandoDados, setSalvandoDados] = useState(false);
  const [erroSalvarDados, setErroSalvarDados] = useState<string | null>(null);
  const [sucessoDados, setSucessoDados] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [errosSenha, setErrosSenha] = useState<{ senhaAtual?: string; novaSenha?: string; confirmarSenha?: string }>(
    {}
  );
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [erroSalvarSenha, setErroSalvarSenha] = useState<string | null>(null);
  const [sucessoSenha, setSucessoSenha] = useState(false);

  const timeoutDadosRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutSenhaRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      const mensagem = error instanceof Error ? error.message : 'Não foi possível carregar seus dados.';
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
      if (timeoutDadosRef.current) {
        clearTimeout(timeoutDadosRef.current);
      }
      if (timeoutSenhaRef.current) {
        clearTimeout(timeoutSenhaRef.current);
      }
    };
  }, []);

  function validarDados() {
    const erros: { nome?: string; email?: string } = {};

    if (!nome.trim()) {
      erros.nome = 'Nome é obrigatório';
    }

    if (!email.trim()) {
      erros.email = 'E-mail é obrigatório';
    } else if (!isEmailValido(email)) {
      erros.email = 'Informe um e-mail válido';
    }

    setErrosDados(erros);
    return Object.keys(erros).length === 0;
  }

  async function handleSalvarDados() {
    if (salvandoDados || !user?.id) {
      return;
    }

    setErroSalvarDados(null);
    setSucessoDados(false);

    if (!validarDados()) {
      return;
    }

    setSalvandoDados(true);

    try {
      // PUT substitui o recurso inteiro — mescla com o que já foi carregado
      // para não apagar campos que esta tela não edita (cpf, roles, etc).
      const payload = {
        ...(perfilBruto ?? {}),
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim() || undefined,
      };

      await usuarioService.atualizarPerfil(user.id, payload);
      await updateUser({ nome: nome.trim(), email: email.trim() });

      setSucessoDados(true);
      timeoutDadosRef.current = setTimeout(() => setSucessoDados(false), 2500);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Não foi possível salvar suas alterações.';
      setErroSalvarDados(mensagem);
    } finally {
      setSalvandoDados(false);
    }
  }

  function validarSenha() {
    const erros: { senhaAtual?: string; novaSenha?: string; confirmarSenha?: string } = {};

    if (!senhaAtual) {
      erros.senhaAtual = 'Senha atual é obrigatória';
    }

    const resultado = validarSenhaForte(novaSenha);
    if (!resultado.isValid) {
      erros.novaSenha = resultado.errors[0];
    }

    if (!confirmarSenha) {
      erros.confirmarSenha = 'Confirme a nova senha';
    } else if (confirmarSenha !== novaSenha) {
      erros.confirmarSenha = 'As senhas não coincidem';
    }

    setErrosSenha(erros);
    return Object.keys(erros).length === 0;
  }

  async function handleAlterarSenha() {
    if (salvandoSenha || !user?.id) {
      return;
    }

    setErroSalvarSenha(null);
    setSucessoSenha(false);

    if (!validarSenha()) {
      return;
    }

    setSalvandoSenha(true);

    try {
      await usuarioService.alterarSenha(user.id, { senhaAtual, novaSenha });

      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      setSucessoSenha(true);
      timeoutSenhaRef.current = setTimeout(() => setSucessoSenha(false), 2500);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Não foi possível alterar sua senha.';
      setErroSalvarSenha(mensagem);
    } finally {
      setSalvandoSenha(false);
    }
  }

  if (carregando) {
    return <EstadoCarregamento mensagem="Carregando seus dados..." />;
  }

  if (erroCarregamento) {
    return <EstadoErro mensagem={erroCarregamento} acaoTexto="Tentar novamente" onAcao={carregarPerfil} />;
  }

  const roles = (perfil?.roles ?? []).map((role) => ROTULOS_ROLE[role] ?? role);

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-100">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        {roles.length > 0 ? (
          <Text className="mb-4 text-sm text-gray-500">{roles.join(', ')}</Text>
        ) : null}

        <Text className="mb-2 text-xs font-semibold uppercase text-gray-400">Informações pessoais</Text>

        {erroSalvarDados ? <Alerta tipo="erro" mensagem={erroSalvarDados} /> : null}
        {sucessoDados ? <Alerta tipo="sucesso" mensagem="Dados atualizados com sucesso!" /> : null}

        <CampoTexto
          label="Nome"
          placeholder="Seu nome completo"
          value={nome}
          onChangeText={setNome}
          editable={!salvandoDados}
          error={errosDados.nome}
          semMargemSuperior
        />

        <CampoTexto
          label="E-mail"
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!salvandoDados}
          error={errosDados.email}
        />

        <CampoTexto
          label="Telefone"
          placeholder="(00) 00000-0000"
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="phone-pad"
          editable={!salvandoDados}
        />

        <Button
          texto="Salvar alterações"
          onClick={handleSalvarDados}
          loading={salvandoDados}
          className="mt-6 bg-red-700"
          textClassName="text-white"
        />

        <View className="mt-6 rounded-xl border border-gray-200 bg-white">
          <InfoLinha icone="card-outline" label="CPF" valor={perfil?.cpf} />
          <InfoLinha
            icone="calendar-outline"
            label="Data de nascimento"
            valor={perfil?.dataNascimento ? formatarDataSimples(perfil.dataNascimento) : undefined}
            ultimo
          />
        </View>

        <Text className="mb-2 mt-8 text-xs font-semibold uppercase text-gray-400">Segurança</Text>

        {erroSalvarSenha ? <Alerta tipo="erro" mensagem={erroSalvarSenha} /> : null}
        {sucessoSenha ? <Alerta tipo="sucesso" mensagem="Senha alterada com sucesso!" /> : null}

        <CampoTexto
          label="Senha atual"
          placeholder="Sua senha atual"
          value={senhaAtual}
          onChangeText={setSenhaAtual}
          isPassword
          autoCapitalize="none"
          editable={!salvandoSenha}
          error={errosSenha.senhaAtual}
          semMargemSuperior
        />

        <CampoTexto
          label="Nova senha"
          placeholder="Mínimo 8 caracteres, maiúscula, número e símbolo"
          value={novaSenha}
          onChangeText={setNovaSenha}
          isPassword
          autoCapitalize="none"
          editable={!salvandoSenha}
          error={errosSenha.novaSenha}
        />

        <CampoTexto
          label="Confirmar nova senha"
          placeholder="Repita a nova senha"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          isPassword
          autoCapitalize="none"
          editable={!salvandoSenha}
          error={errosSenha.confirmarSenha}
        />

        <Button
          texto="Alterar senha"
          onClick={handleAlterarSenha}
          loading={salvandoSenha}
          className="mt-6 mb-4 bg-red-700"
          textClassName="text-white"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

import { Alerta } from '@/components/Alerta';
import { AuthCard } from '@/components/AuthCard';
import { Button } from '@/components/Button';
import { CampoTexto } from '@/components/CampoTexto';
import { router } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isEmailValido } from '../utils/validacao/emailValidacao';
import { validarSenhaForte } from '../utils/validacao/senhaValidacao';

type ErrosCadastro = {
  nome?: string;
  cpf?: string;
  dataNascimento?: string;
  email?: string;
  senha?: string;
  confirmarSenha?: string;
};

function converterDataParaIso(dataBr: string): string | null {
  const match = dataBr.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    return null;
  }

  const [, dia, mes, ano] = match;
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
  const dataValida =
    data.getFullYear() === Number(ano) &&
    data.getMonth() === Number(mes) - 1 &&
    data.getDate() === Number(dia);

  if (!dataValida) {
    return null;
  }

  return `${ano}-${mes}-${dia}`;
}

export default function Cadastro() {
  const { cadastrar } = useAuth();

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [errosCampos, setErrosCampos] = useState<ErrosCadastro>({});
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  function validarCampos() {
    const erros: ErrosCadastro = {};

    if (!nome.trim()) {
      erros.nome = 'Nome completo é obrigatório';
    }

    const cpfLimpo = cpf.replace(/\D/g, '');
    if (!cpfLimpo) {
      erros.cpf = 'CPF é obrigatório';
    } else if (cpfLimpo.length !== 11) {
      erros.cpf = 'CPF deve ter 11 dígitos';
    }

    if (dataNascimento.trim() && !converterDataParaIso(dataNascimento)) {
      erros.dataNascimento = 'Data inválida (use dd/mm/aaaa)';
    }

    if (!email.trim()) {
      erros.email = 'E-mail é obrigatório';
    } else if (!isEmailValido(email)) {
      erros.email = 'Informe um e-mail válido';
    }

    const validacaoSenha = validarSenhaForte(senha);
    if (!validacaoSenha.isValid) {
      erros.senha = validacaoSenha.errors[0];
    }

    if (!confirmarSenha) {
      erros.confirmarSenha = 'Confirme sua senha';
    } else if (confirmarSenha !== senha) {
      erros.confirmarSenha = 'As senhas não coincidem';
    }

    setErrosCampos(erros);
    return Object.keys(erros).length === 0;
  }

  async function handleCadastro() {
    if (carregando) {
      return;
    }

    setErro(null);

    if (!validarCampos()) {
      return;
    }

    setCarregando(true);

    try {
      const dataNascimentoIso = dataNascimento.trim()
        ? converterDataParaIso(dataNascimento)
        : null;

      const response = await cadastrar({
        nome: nome.trim(),
        cpf: cpf.replace(/\D/g, ''),
        email: email.trim(),
        telefone: telefone.trim() || undefined,
        dataNascimento: dataNascimentoIso || undefined,
        senha,
      });

      if (response.token) {
        router.replace('/');
        return;
      }

      router.replace({
        pathname: '/login',
        params: { mensagem: 'Cadastro realizado com sucesso! Faça login para continuar.' },
      });
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Não foi possível cadastrar.';
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <AuthCard
      titulo="Criar conta"
      subtitulo="Preencha os dados abaixo para criar sua conta"
      footerTexto="Já tem uma conta?"
      footerAcaoTexto="Faça login"
      onFooterPress={() => router.replace('/login')}
    >
      {erro ? <Alerta tipo="erro" mensagem={erro} /> : null}

      <CampoTexto
        label="Nome completo"
        placeholder="Digite seu nome completo"
        value={nome}
        onChangeText={setNome}
        editable={!carregando}
        error={errosCampos.nome}
        semMargemSuperior
      />

      <CampoTexto
        label="CPF"
        placeholder="000.000.000-00"
        value={cpf}
        onChangeText={setCpf}
        keyboardType="numeric"
        editable={!carregando}
        error={errosCampos.cpf}
      />

      <CampoTexto
        label="Data de nascimento (opcional)"
        placeholder="dd/mm/aaaa"
        value={dataNascimento}
        onChangeText={setDataNascimento}
        keyboardType="numeric"
        editable={!carregando}
        error={errosCampos.dataNascimento}
      />

      <CampoTexto
        label="Email"
        placeholder="seu@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!carregando}
        error={errosCampos.email}
      />

      <CampoTexto
        label="Telefone (opcional)"
        placeholder="(00) 00000-0000"
        value={telefone}
        onChangeText={setTelefone}
        keyboardType="phone-pad"
        editable={!carregando}
      />

      <CampoTexto
        label="Senha"
        placeholder="Mínimo 8 caracteres"
        value={senha}
        onChangeText={setSenha}
        isPassword
        autoCapitalize="none"
        editable={!carregando}
        error={errosCampos.senha}
      />

      <CampoTexto
        label="Confirmar senha"
        placeholder="Confirme sua senha"
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
        isPassword
        autoCapitalize="none"
        editable={!carregando}
        error={errosCampos.confirmarSenha}
      />

      <Button
        texto="Cadastrar"
        onClick={handleCadastro}
        loading={carregando}
        className="mt-5 mb-4 bg-red-700 w-full"
        textClassName="text-white"
      />
    </AuthCard>
  );
}

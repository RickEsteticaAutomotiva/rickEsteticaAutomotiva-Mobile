import { Alerta } from '@/components/Alerta';
import { AuthCard } from '@/components/AuthCard';
import { Button } from '@/components/Button';
import { CampoTexto } from '@/components/CampoTexto';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isEmailValido } from '../utils/validacao/emailValidacao';

export default function Login() {
  const { login } = useAuth();
  const { mensagem: mensagemSucesso } = useLocalSearchParams<{ mensagem?: string }>();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errosCampos, setErrosCampos] = useState<{ email?: string; senha?: string }>({});
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  function validarCampos() {
    const erros: { email?: string; senha?: string } = {};

    if (!email.trim()) {
      erros.email = 'E-mail é obrigatório';
    } else if (!isEmailValido(email)) {
      erros.email = 'Informe um e-mail válido';
    }

    if (!senha) {
      erros.senha = 'Senha é obrigatória';
    }

    setErrosCampos(erros);
    return Object.keys(erros).length === 0;
  }

  async function handleLogin() {
    if (carregando) {
      return;
    }

    setErro(null);

    if (!validarCampos()) {
      return;
    }

    setCarregando(true);

    try {
      await login(email, senha);
      router.replace('/');
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Não foi possível fazer login.';
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <AuthCard
      titulo="Bem-vindo de volta!"
      subtitulo="Faça login para acessar sua conta"
      footerTexto="Não tem uma conta?"
      footerAcaoTexto="Cadastre-se"
      onFooterPress={() => router.push('/cadastro')}
    >
      {mensagemSucesso ? <Alerta tipo="sucesso" mensagem={mensagemSucesso} /> : null}
      {erro ? <Alerta tipo="erro" mensagem={erro} /> : null}

      <CampoTexto
        label="Email"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!carregando}
        error={errosCampos.email}
        semMargemSuperior
      />

      <CampoTexto
        label="Senha"
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        isPassword
        autoCapitalize="none"
        editable={!carregando}
        error={errosCampos.senha}
      />

      <Button
        texto="Entrar"
        onClick={handleLogin}
        loading={carregando}
        className="mt-5 mb-4 bg-red-700 w-full"
        textClassName="text-white"
      />
    </AuthCard>
  );
}

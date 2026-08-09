const MIN_PASSWORD_LENGTH = 8;
const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const NUMBER_REGEX = /\d/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{}|;':"\\,.<>/?]/;

export function obterChecklistSenha(senha) {
  const valorSenha = typeof senha === "string" ? senha : "";
  const senhaSemEspacos = valorSenha.trim();

  return [
    {
      id: "notBlank",
      label: "Nao pode ser nula ou em branco",
      isValid: senhaSemEspacos.length > 0
    },
    {
      id: "minLength",
      label: "Minimo de 8 caracteres",
      isValid: valorSenha.length >= MIN_PASSWORD_LENGTH
    },
    {
      id: "uppercase",
      label: "Pelo menos 1 letra maiuscula",
      isValid: UPPERCASE_REGEX.test(valorSenha)
    },
    {
      id: "lowercase",
      label: "Pelo menos 1 letra minuscula",
      isValid: LOWERCASE_REGEX.test(valorSenha)
    },
    {
      id: "number",
      label: "Pelo menos 1 numero",
      isValid: NUMBER_REGEX.test(valorSenha)
    },
    {
      id: "special",
      label: "Pelo menos 1 caractere especial (!@#$%^&*()_+-=[]{}|;':\"<>,.?/)",
      isValid: SPECIAL_CHAR_REGEX.test(valorSenha)
    }
  ];
}

export function validarSenhaForte(senha) {
  const erros = [];
  const checklist = obterChecklistSenha(senha);

  if (!checklist.find((item) => item.id === "notBlank")?.isValid) {
    erros.push("Senha e obrigatoria");
  }

  if (!checklist.find((item) => item.id === "minLength")?.isValid) {
    erros.push("Senha deve ter pelo menos 8 caracteres");
  }

  if (!checklist.find((item) => item.id === "uppercase")?.isValid) {
    erros.push("Senha deve conter pelo menos 1 letra maiuscula");
  }

  if (!checklist.find((item) => item.id === "lowercase")?.isValid) {
    erros.push("Senha deve conter pelo menos 1 letra minuscula");
  }

  if (!checklist.find((item) => item.id === "number")?.isValid) {
    erros.push("Senha deve conter pelo menos 1 numero");
  }

  if (!checklist.find((item) => item.id === "special")?.isValid) {
    erros.push("Senha deve conter pelo menos 1 caractere especial (!@#$%^&*()_+-=[]{}|;':\"<>,.?/)");
  }

  // Evita mensagens redundantes quando o campo ainda estiver vazio.
  if (erros.length > 1 && erros[0] === "Senha e obrigatoria") {
    return {
      isValid: false,
      errors: ["Senha e obrigatoria"]
    };
  }

  return {
    isValid: erros.length === 0,
    errors: erros
  };
}

export type Categoria = {
  id: string | number;
  nome: string;
  imagem?: string;
};

export type Servico = {
  id: string | number;
  nome: string;
  descricao: string;
  preco: number | string;
  imagem?: string;
};

export type ItemCarrinho = {
  idCarrinho: string | number;
  idServico: string | number;
  nome: string;
  descricao: string;
  preco: number | string;
  imagem?: string;
};

export type Veiculo = {
  id: string | number;
  idPessoa?: string | number;
  placa: string;
  modelo: string;
  marca: string;
  porte?: string;
  cor: string;
  ano: string;
};

export type HorarioDisponivel = {
  inicio: string;
  fim: string;
};

export type Favorito = {
  id: string | number;
  idServico: string | number;
};

export type ItemOrdemServico = {
  id: string | number;
  nome: string;
  preco: number | string;
};

export type StatusOrdemServico = {
  id: number | null;
  nome: string;
};

export type OrdemServico = {
  id: string | number;
  dataAgendamento?: string;
  status: StatusOrdemServico;
  veiculo: Veiculo | null;
  servicos: ItemOrdemServico[];
  precoTotal: number;
  observacoes?: string;
  motivoCancelamento?: string;
};

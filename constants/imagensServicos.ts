import type { ImageSourcePropType } from 'react-native';

export const IMAGEM_PADRAO: ImageSourcePropType = require('../assets/carroBanner.png');

type ImagemServico = {
  chaves: string[];
  imagem: ImageSourcePropType;
};

const IMAGENS_SERVICOS: ImagemServico[] = [
  {
    chaves: ['cristalizacao', 'pintura'],
    imagem: require('../assets/servicos/Cristalizacao_de_Pintura.jpg'),
  },
  {
    chaves: ['enceramento'],
    imagem: require('../assets/servicos/Enceramento_tecnico.jpg'),
  },
  {
    chaves: ['higienizacao', 'banco', 'bancos', 'couro', 'tecido'],
    imagem: require('../assets/servicos/Higienizacao_Bancos_Couro_Tecido.jpg'),
  },
  {
    chaves: ['higienizacao', 'interna', 'completa'],
    imagem: require('../assets/servicos/Higienizacao_Interna_Completa.jpg'),
  },
  {
    chaves: ['higienizacao', 'teto', 'coluna', 'colunas'],
    imagem: require('../assets/servicos/Higienizacao_Teto_e_Colunas.jpg'),
  },
  {
    chaves: ['lavagem', 'premium'],
    imagem: require('../assets/servicos/Lavagem_Premium.jpg'),
  },
  {
    chaves: ['lavagem', 'tecnica', 'grande', ' g'],
    imagem: require('../assets/servicos/Lavagem_Tecnica_Carro_G.jpg'),
  },
  {
    chaves: ['lavagem', 'tecnica', 'medio', ' m'],
    imagem: require('../assets/servicos/Lavagem_Tecnica_Carro_M.jpg'),
  },
  {
    chaves: ['lavagem', 'tecnica', 'pequeno', ' p'],
    imagem: require('../assets/servicos/Lavagem_Tecnica_Carro_P.jpg'),
  },
  {
    chaves: ['limpeza', 'profunda', 'inferior'],
    imagem: require('../assets/servicos/Limpeza_Profunda_Da_Parte_Inferior.jpg'),
  },
  {
    chaves: ['limpeza', 'tecnica', 'chassi'],
    imagem: require('../assets/servicos/Limpeza_Tecnica_De_Chassi.jpg'),
  },
  {
    chaves: ['limpeza', 'tecnica', 'motor'],
    imagem: require('../assets/servicos/Limpeza_Tecnica_De_Motor.jpg'),
  },
  {
    chaves: ['oxi', 'sanitizacao'],
    imagem: require('../assets/servicos/Oxi_Sanitizacao.jpg'),
  },
  {
    chaves: ['polimento', 'farol'],
    imagem: require('../assets/servicos/Polimento_de_Farol.jpg'),
  },
  {
    chaves: ['polimento'],
    imagem: require('../assets/servicos/Polimento_Tecnica.jpg'),
  },
  {
    chaves: ['remocao', 'chuva', 'acida', 'vidro', 'vidros'],
    imagem: require('../assets/servicos/Remocao_de_Chuva_Acida_Vidros.jpg'),
  },
  {
    chaves: ['revitalizacao', 'plastico', 'plasticos', 'interno', 'internos'],
    imagem: require('../assets/servicos/Revitalizacao_de_Plasticos_Internos.jpg'),
  },
  {
    chaves: ['vitrificacao', 'couro'],
    imagem: require('../assets/servicos/Vitrificacao_de_Couro.jpg'),
  },
  {
    chaves: ['vitrificacao', 'parabrisa', 'parabrisas'],
    imagem: require('../assets/servicos/Vitrificacao_de_Parabrisa.jpg'),
  },
  {
    chaves: ['vitrificacao', 'plastico', 'plasticos'],
    imagem: require('../assets/servicos/Vitrificacao_de_Plasticos.jpg'),
  },
  {
    chaves: ['vitrificacao', 'pintura'],
    imagem: require('../assets/servicos/Vitrificacao_de_Pintura.jpg'),
  },
];

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export function getImagemServico(nome?: string): ImageSourcePropType {
  if (!nome) {
    return IMAGEM_PADRAO;
  }

  const nomeNormalizado = normalizar(nome);

  let melhorImagem: ImageSourcePropType | null = null;
  let melhorPontuacao = 0;

  for (const { chaves, imagem } of IMAGENS_SERVICOS) {
    const pontuacao = chaves.filter((chave) => nomeNormalizado.includes(chave)).length;
    if (pontuacao > melhorPontuacao) {
      melhorPontuacao = pontuacao;
      melhorImagem = imagem;
    }
  }

  return melhorImagem ?? IMAGEM_PADRAO;
}

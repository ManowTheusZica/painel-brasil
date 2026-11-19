export type Taxa = {
  nome: string;
  valor: number;
};

export type Feriado = {
  date: string;
  name: string;
  type: string;
  weekday?: string;
};

export type Cotacao = {
  code: string;
  codein: string;
  bid: string;
  pctChange: string;
  create_date: string;
  timestamp: string;
};

export type PontoSerie = {
  data: string;
  valor: number;
  variacaoPct: number;
};

export type Cep = {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service: string;
};

export type Empresa = {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string | null;
  descricao_situacao_cadastral?: string;
  municipio?: string;
  uf?: string;
  cnae_fiscal_descricao?: string;
  data_inicio_atividade?: string;
};

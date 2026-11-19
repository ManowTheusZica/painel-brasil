import type { Cep, Cotacao, Empresa, Feriado, PontoSerie, Taxa } from "./tipos";

export const BRASIL_API = "https://brasilapi.com.br/api";
export const AWESOME_API = "https://economia.awesomeapi.com.br/json";

export class ErroApi extends Error {
  readonly status: number;
  constructor(mensagem: string, status: number) {
    super(mensagem);
    this.name = "ErroApi";
    this.status = status;
  }
}

async function pegar<T>(url: string, sinal?: AbortSignal): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(url, { signal: sinal });
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === "AbortError") throw erro;
    throw new ErroApi("Sem conexao com a API. Verifique a rede.", 0);
  }
  if (!resposta.ok) {
    throw new ErroApi("A API respondeu " + resposta.status + " para " + url, resposta.status);
  }
  return (await resposta.json()) as T;
}

export function buscarTaxas(sinal?: AbortSignal): Promise<Taxa[]> {
  return pegar<Taxa[]>(BRASIL_API + "/taxas/v1", sinal);
}

export function buscarFeriados(ano: number, sinal?: AbortSignal): Promise<Feriado[]> {
  return pegar<Feriado[]>(BRASIL_API + "/feriados/v1/" + ano, sinal);
}

/**
 * Serie diaria do dolar, em ordem cronologica.
 *
 * O endpoint /daily devolve apenas `timestamp` (segundos unix) — diferente do
 * /last, que traz `create_date`. Normalizar aqui evita que a data ausente
 * vaze para a tela (foi exatamente esse o bug da primeira versao).
 */
export function buscarSerieDolar(dias = 30, sinal?: AbortSignal): Promise<PontoSerie[]> {
  return pegar<Array<Partial<Cotacao>>>(AWESOME_API + "/daily/USD-BRL/" + dias, sinal).then(
    (serie) =>
      serie
        .map((item) => ({
          data: dataDeCotacao(item),
          valor: Number(item.bid),
          variacaoPct: Number(item.pctChange ?? 0),
        }))
        .filter((ponto) => ponto.data !== "" && Number.isFinite(ponto.valor))
        .sort((a, b) => a.data.localeCompare(b.data)),
  );
}

function dataDeCotacao(item: Partial<Cotacao>): string {
  if (typeof item.create_date === "string" && item.create_date.length >= 10) {
    return item.create_date.slice(0, 10);
  }
  const segundos = Number(item.timestamp);
  if (!Number.isFinite(segundos) || segundos <= 0) return "";
  return new Date(segundos * 1000).toISOString().slice(0, 10);
}

export function buscarUltimaCotacao(sinal?: AbortSignal): Promise<{ USD?: Cotacao; EUR?: Cotacao }> {
  return pegar<{ USD?: Cotacao; EUR?: Cotacao }>(
    AWESOME_API + "/last/USD-BRL,EUR-BRL",
    sinal,
  ).then((bruto) => {
    const registro = bruto as unknown as Record<string, Cotacao | undefined>;
    return { USD: registro["USDBRL"], EUR: registro["EURBRL"] };
  });
}

export function buscarCep(cep: string, sinal?: AbortSignal): Promise<Cep> {
  const limpo = cep.replace(/\D/g, "");
  return pegar<Cep>(BRASIL_API + "/cep/v2/" + limpo, sinal);
}

export function buscarCnpj(cnpj: string, sinal?: AbortSignal): Promise<Empresa> {
  const limpo = cnpj.replace(/\D/g, "");
  return pegar<Empresa>(BRASIL_API + "/cnpj/v1/" + limpo, sinal);
}

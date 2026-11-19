const MOEDA = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

const NUMERO = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatarMoeda(valor: number): string {
  return MOEDA.format(valor);
}

export function formatarNumero(valor: number): string {
  return NUMERO.format(valor);
}

export function formatarPercentual(valor: number): string {
  const sinal = valor > 0 ? "+" : "";
  return sinal + NUMERO.format(valor) + "%";
}

export function formatarData(iso: string): string {
  const data = new Date(iso.length === 10 ? iso + "T12:00:00" : iso);
  if (Number.isNaN(data.getTime())) return iso;
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatarCep(valor: string): string {
  const limpo = valor.replace(/\D/g, "").padEnd(8, "0").slice(0, 8);
  return limpo.slice(0, 5) + "-" + limpo.slice(5);
}

export function formatarCnpj(valor: string): string {
  const limpo = valor.replace(/\D/g, "").padEnd(14, "0").slice(0, 14);
  return (
    limpo.slice(0, 2) +
    "." +
    limpo.slice(2, 5) +
    "." +
    limpo.slice(5, 8) +
    "/" +
    limpo.slice(8, 12) +
    "-" +
    limpo.slice(12)
  );
}

export function diasAte(iso: string, hoje = new Date()): number {
  const alvo = new Date(iso + "T00:00:00");
  if (Number.isNaN(alvo.getTime())) return 0;
  const base = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return Math.round((alvo.getTime() - base.getTime()) / 86400000);
}

export function variacao(anterior: number, atual: number): number {
  if (!anterior) return 0;
  return ((atual - anterior) / anterior) * 100;
}

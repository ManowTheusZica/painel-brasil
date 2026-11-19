import { formatarPercentual } from "../lib/formatar";

type Props = {
  rotulo: string;
  valor: string;
  variacao?: number | null;
  detalhe?: string;
};

export function KpiCard({ rotulo, valor, variacao, detalhe }: Props) {
  const temVariacao = typeof variacao === "number" && Number.isFinite(variacao);
  const classeVariacao = temVariacao ? (variacao >= 0 ? "alta" : "queda") : "";

  return (
    <article className="kpi">
      <span className="kpi-rotulo">{rotulo}</span>
      <strong className="kpi-valor">{valor}</strong>
      {temVariacao ? (
        <span className={"kpi-variacao " + classeVariacao}>{formatarPercentual(variacao)}</span>
      ) : null}
      {detalhe ? <span className="kpi-detalhe">{detalhe}</span> : null}
    </article>
  );
}

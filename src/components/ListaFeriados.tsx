import { diasAte, formatarData } from "../lib/formatar";
import type { Feriado } from "../tipos";

type Props = {
  feriados: Feriado[];
  hoje?: Date;
  limite?: number;
};

export function ListaFeriados({ feriados, hoje = new Date(), limite = 5 }: Props) {
  const futuros = feriados
    .map((feriado) => ({ ...feriado, dias: diasAte(feriado.date, hoje) }))
    .filter((feriado) => feriado.dias >= 0)
    .sort((a, b) => a.dias - b.dias)
    .slice(0, limite);

  if (futuros.length === 0) {
    return <p className="vazio">Nenhum feriado nacional pela frente neste calendario.</p>;
  }

  return (
    <ul className="feriados">
      {futuros.map((feriado) => (
        <li key={feriado.date + feriado.name}>
          <span className="feriado-data">{formatarData(feriado.date)}</span>
          <span className="feriado-nome">{feriado.name}</span>
          <span className="feriado-dias">
            {feriado.dias === 0 ? "hoje" : feriado.dias === 1 ? "amanha" : "em " + feriado.dias + " dias"}
          </span>
        </li>
      ))}
    </ul>
  );
}

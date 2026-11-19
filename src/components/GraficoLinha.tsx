type Ponto = { rotulo: string; valor: number };

type Props = {
  pontos: Ponto[];
  altura?: number;
  rotuloAcessivel: string;
};

const LARGURA = 640;
const MARGEM = 8;

/** Grafico de area em SVG puro: sem biblioteca, sem canvas, escala com o container. */
export function GraficoLinha({ pontos, altura = 180, rotuloAcessivel }: Props) {
  if (pontos.length < 2) {
    return <p className="grafico-vazio">Sem dados suficientes para o grafico.</p>;
  }

  const valores = pontos.map((ponto) => ponto.valor);
  const minimo = Math.min(...valores);
  const maximo = Math.max(...valores);
  const intervalo = maximo - minimo || 1;
  const passoX = (LARGURA - MARGEM * 2) / (pontos.length - 1);

  const coordenadas = pontos.map((ponto, indice) => {
    const x = MARGEM + indice * passoX;
    const y = MARGEM + (1 - (ponto.valor - minimo) / intervalo) * (altura - MARGEM * 2);
    return { x, y, ponto };
  });

  const linha = coordenadas
    .map((c, indice) => (indice === 0 ? "M" : "L") + c.x.toFixed(1) + " " + c.y.toFixed(1))
    .join(" ");
  const area =
    linha +
    " L" +
    (MARGEM + (pontos.length - 1) * passoX).toFixed(1) +
    " " +
    (altura - MARGEM) +
    " L" +
    MARGEM +
    " " +
    (altura - MARGEM) +
    " Z";

  const primeiro = coordenadas[0];
  const ultimo = coordenadas[coordenadas.length - 1];

  return (
    <figure className="grafico">
      <svg
        viewBox={"0 0 " + LARGURA + " " + altura}
        role="img"
        aria-label={rotuloAcessivel}
        preserveAspectRatio="none"
        className="grafico-svg"
      >
        <defs>
          <linearGradient id="area-gradiente" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--azul)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--azul)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#area-gradiente)" />
        <path d={linha} fill="none" stroke="var(--azul)" strokeWidth="2.5" strokeLinejoin="round" />
        {primeiro ? <circle cx={primeiro.x} cy={primeiro.y} r="3" fill="var(--azul)" /> : null}
        {ultimo ? <circle cx={ultimo.x} cy={ultimo.y} r="4" fill="#fff" stroke="var(--azul)" strokeWidth="2" /> : null}
      </svg>
      <figcaption className="grafico-legenda">
        <span>min {minimo.toFixed(2)}</span>
        <span>max {maximo.toFixed(2)}</span>
        <span>
          {pontos.length} pontos · {pontos[pontos.length - 1]?.rotulo ?? ""}
        </span>
      </figcaption>
    </figure>
  );
}

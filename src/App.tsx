import { useState } from "react";
import { buscarFeriados, buscarSerieDolar, buscarTaxas, buscarUltimaCotacao } from "./api";
import { ConsultaCep } from "./components/ConsultaCep";
import { ConsultaCnpj } from "./components/ConsultaCnpj";
import { Carregando, Erro } from "./components/Estados";
import { GraficoLinha } from "./components/GraficoLinha";
import { KpiCard } from "./components/KpiCard";
import { ListaFeriados } from "./components/ListaFeriados";
import { useApi } from "./hooks/useApi";
import { formatarData, formatarMoeda, formatarNumero, variacao } from "./lib/formatar";

const ANO = new Date().getFullYear();

export function App() {
  const [versao, setVersao] = useState(0);
  const atualizar = () => setVersao((valor) => valor + 1);

  const taxas = useApi(buscarTaxas, [versao]);
  const cotacoes = useApi(buscarUltimaCotacao, [versao]);
  const serie = useApi((sinal) => buscarSerieDolar(30, sinal), [versao]);
  const feriados = useApi((sinal) => buscarFeriados(ANO, sinal), [versao]);

  const porNome = (nome: string) => taxas.dados?.find((taxa) => taxa.nome === nome)?.valor ?? null;
  const dolar = cotacoes.dados?.USD;
  const euro = cotacoes.dados?.EUR;

  const pontos = (serie.dados ?? []).map((ponto) => ({
    rotulo: formatarData(ponto.data),
    valor: ponto.valor,
  }));
  const primeiro = pontos[0];
  const ultimo = pontos[pontos.length - 1];
  const variacaoSerie = primeiro && ultimo ? variacao(primeiro.valor, ultimo.valor) : null;

  return (
    <div className="pagina">
      <header className="topo">
        <div>
          <h1>Painel Brasil</h1>
          <p className="subtitulo">
            Indicadores economicos e consultas publicas — dados ao vivo do Banco Central via BrasilAPI.
          </p>
        </div>
        <button type="button" className="botao" onClick={atualizar}>
          atualizar
        </button>
      </header>

      {taxas.carregando && cotacoes.carregando ? (
        <Carregando texto="Carregando indicadores…" />
      ) : (
        <section className="kpis" aria-label="Indicadores">
          {taxas.erro ? <Erro mensagem={taxas.erro} aoTentar={atualizar} /> : null}
          {porNome("Selic") !== null ? (
            <KpiCard
              rotulo="Selic (a.a.)"
              valor={formatarNumero(porNome("Selic") ?? 0) + "%"}
              detalhe="taxa basica"
            />
          ) : null}
          {porNome("CDI") !== null ? (
            <KpiCard
              rotulo="CDI (a.a.)"
              valor={formatarNumero(porNome("CDI") ?? 0) + "%"}
              detalhe="renda fixa"
            />
          ) : null}
          {porNome("IPCA") !== null ? (
            <KpiCard
              rotulo="IPCA (12m)"
              valor={formatarNumero(porNome("IPCA") ?? 0) + "%"}
              detalhe="inflacao oficial"
            />
          ) : null}
          {dolar ? (
            <KpiCard
              rotulo="Dolar"
              valor={formatarMoeda(Number(dolar.bid))}
              variacao={Number(dolar.pctChange)}
              detalhe={formatarData(dolar.create_date.slice(0, 10))}
            />
          ) : null}
          {euro ? (
            <KpiCard
              rotulo="Euro"
              valor={formatarMoeda(Number(euro.bid))}
              variacao={Number(euro.pctChange)}
              detalhe={formatarData(euro.create_date.slice(0, 10))}
            />
          ) : null}
        </section>
      )}

      <section className="cartao" aria-labelledby="titulo-dolar">
        <h2 id="titulo-dolar">
          Dolar comercial — ultimos 30 dias
          {variacaoSerie !== null ? (
            <span className={"pilula " + (variacaoSerie >= 0 ? "alta" : "queda")}>
              {variacaoSerie >= 0 ? "+" : ""}
              {formatarNumero(variacaoSerie)}% no periodo
            </span>
          ) : null}
        </h2>
        {serie.carregando ? <Carregando texto="Carregando serie…" /> : null}
        {serie.erro ? <Erro mensagem={serie.erro} aoTentar={atualizar} /> : null}
        {serie.dados ? (
          <GraficoLinha pontos={pontos} rotuloAcessivel="Cotacao do dolar nos ultimos 30 dias" />
        ) : null}
      </section>

      <div className="duas-colunas">
        <ConsultaCep />
        <ConsultaCnpj />
      </div>

      <section className="cartao" aria-labelledby="titulo-feriados">
        <h2 id="titulo-feriados">Proximos feriados nacionais</h2>
        {feriados.carregando ? <Carregando texto="Carregando calendario…" /> : null}
        {feriados.erro ? <Erro mensagem={feriados.erro} aoTentar={atualizar} /> : null}
        {feriados.dados ? <ListaFeriados feriados={feriados.dados} /> : null}
      </section>

      <footer className="rodape">
        <p>
          Fontes:{" "}
          <a href="https://brasilapi.com.br" target="_blank" rel="noreferrer">
            BrasilAPI
          </a>{" "}
          e{" "}
          <a href="https://docs.awesomeapi.com.br" target="_blank" rel="noreferrer">
            AwesomeAPI
          </a>
          . Nenhum dado e armazenado no navegador.
        </p>
      </footer>
    </div>
  );
}

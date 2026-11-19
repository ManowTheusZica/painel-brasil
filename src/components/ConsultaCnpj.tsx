import { useState } from "react";
import { buscarCnpj } from "../api";
import { formatarCnpj, formatarData } from "../lib/formatar";
import { validarCnpj } from "../lib/validar";
import type { Empresa } from "../tipos";
import { Carregando, Erro } from "./Estados";

export function ConsultaCnpj() {
  const [entrada, setEntrada] = useState("19.131.243/0001-97");
  const [resultado, setResultado] = useState<Empresa | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const valido = validarCnpj(entrada);

  async function consultar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!valido) return;
    setCarregando(true);
    setErro(null);
    setResultado(null);
    try {
      setResultado(await buscarCnpj(entrada));
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Erro ao consultar o CNPJ");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="cartao consulta" aria-labelledby="titulo-cnpj">
      <h2 id="titulo-cnpj">Consultar CNPJ</h2>
      <form onSubmit={consultar} className="linha-form">
        <input
          aria-label="CNPJ"
          inputMode="numeric"
          value={entrada}
          onChange={(evento) => setEntrada(evento.target.value)}
          placeholder="00.000.000/0000-00"
          maxLength={18}
        />
        <button type="submit" disabled={!valido || carregando}>
          consultar
        </button>
      </form>
      {!valido ? <p className="dica">CNPJ invalido — confira os digitos verificadores.</p> : null}
      {carregando ? <Carregando texto="Buscando CNPJ…" /> : null}
      {erro ? <Erro mensagem={erro} /> : null}
      {resultado ? (
        <dl className="resultado">
          <dt>Razao social</dt>
          <dd>{resultado.razao_social}</dd>
          {resultado.nome_fantasia ? (
            <>
              <dt>Nome fantasia</dt>
              <dd>{resultado.nome_fantasia}</dd>
            </>
          ) : null}
          <dt>Situacao</dt>
          <dd>{resultado.descricao_situacao_cadastral ?? "—"}</dd>
          <dt>Atividade</dt>
          <dd>{resultado.cnae_fiscal_descricao ?? "—"}</dd>
          <dt>Local</dt>
          <dd>
            {(resultado.municipio ?? "—") + " / " + (resultado.uf ?? "—")}
          </dd>
          <dt>Abertura</dt>
          <dd>{resultado.data_inicio_atividade ? formatarData(resultado.data_inicio_atividade) : "—"}</dd>
          <dt>CNPJ</dt>
          <dd>{formatarCnpj(resultado.cnpj)}</dd>
        </dl>
      ) : null}
    </section>
  );
}

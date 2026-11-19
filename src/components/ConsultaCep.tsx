import { useState } from "react";
import { buscarCep } from "../api";
import { formatarCep } from "../lib/formatar";
import { validarCep } from "../lib/validar";
import type { Cep } from "../tipos";
import { Carregando, Erro } from "./Estados";

export function ConsultaCep() {
  const [entrada, setEntrada] = useState("01310-100");
  const [resultado, setResultado] = useState<Cep | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const valido = validarCep(entrada);

  async function consultar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!valido) return;
    setCarregando(true);
    setErro(null);
    setResultado(null);
    try {
      setResultado(await buscarCep(entrada));
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Erro ao consultar o CEP");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="cartao consulta" aria-labelledby="titulo-cep">
      <h2 id="titulo-cep">Consultar CEP</h2>
      <form onSubmit={consultar} className="linha-form">
        <input
          aria-label="CEP"
          inputMode="numeric"
          value={entrada}
          onChange={(evento) => setEntrada(evento.target.value)}
          placeholder="00000-000"
          maxLength={9}
        />
        <button type="submit" disabled={!valido || carregando}>
          consultar
        </button>
      </form>
      {!valido ? <p className="dica">Informe os 8 digitos do CEP.</p> : null}
      {carregando ? <Carregando texto="Buscando CEP…" /> : null}
      {erro ? <Erro mensagem={erro} /> : null}
      {resultado ? (
        <dl className="resultado">
          <dt>Endereco</dt>
          <dd>
            {resultado.street || "—"}
            {resultado.neighborhood ? ", " + resultado.neighborhood : ""}
          </dd>
          <dt>Cidade</dt>
          <dd>
            {resultado.city} / {resultado.state}
          </dd>
          <dt>CEP</dt>
          <dd>{formatarCep(resultado.cep)}</dd>
        </dl>
      ) : null}
    </section>
  );
}

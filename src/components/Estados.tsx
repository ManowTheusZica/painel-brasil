export function Carregando({ texto = "Carregando…" }: { texto?: string }) {
  return (
    <div className="estado carregando" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      {texto}
    </div>
  );
}

export function Erro({ mensagem, aoTentar }: { mensagem: string; aoTentar?: () => void }) {
  return (
    <div className="estado erro" role="alert">
      <strong>Nao foi possivel carregar.</strong> <span>{mensagem}</span>
      {aoTentar ? (
        <button type="button" className="botao-texto" onClick={aoTentar}>
          tentar de novo
        </button>
      ) : null}
    </div>
  );
}

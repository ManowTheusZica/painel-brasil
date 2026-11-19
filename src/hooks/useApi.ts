import { useEffect, useState } from "react";

export type EstadoApi<T> = {
  dados: T | null;
  erro: string | null;
  carregando: boolean;
};

/** Executa uma funcao assincrona e expoe dados/erro/carregando, cancelando ao desmontar. */
export function useApi<T>(
  buscar: (sinal: AbortSignal) => Promise<T>,
  dependencias: readonly unknown[],
): EstadoApi<T> {
  const [estado, setEstado] = useState<EstadoApi<T>>({ dados: null, erro: null, carregando: true });

  useEffect(() => {
    const controle = new AbortController();
    let ativo = true;
    setEstado({ dados: null, erro: null, carregando: true });

    buscar(controle.signal)
      .then((dados) => {
        if (ativo) setEstado({ dados, erro: null, carregando: false });
      })
      .catch((erro: unknown) => {
        if (!ativo) return;
        if (erro instanceof DOMException && erro.name === "AbortError") return;
        const mensagem = erro instanceof Error ? erro.message : "Erro desconhecido";
        setEstado({ dados: null, erro: mensagem, carregando: false });
      });

    return () => {
      ativo = false;
      controle.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencias);

  return estado;
}

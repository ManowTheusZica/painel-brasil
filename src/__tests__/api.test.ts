import { afterEach, describe, expect, it, vi } from "vitest";
import { ErroApi, buscarCep, buscarCnpj, buscarFeriados, buscarSerieDolar, buscarTaxas, buscarUltimaCotacao } from "../api";

function responder(corpo: unknown, status = 200) {
  const espiao = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => corpo,
  } as Response);
  vi.stubGlobal("fetch", espiao);
  return espiao;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("buscarTaxas", () => {
  it("devolve a lista da BrasilAPI", async () => {
    responder([{ nome: "Selic", valor: 13.75 }]);
    const taxas = await buscarTaxas();
    expect(taxas[0]?.nome).toBe("Selic");
  });

  it("chama o endpoint certo", async () => {
    const espiao = responder([]);
    await buscarTaxas();
    expect(espiao.mock.calls[0]?.[0]).toBe("https://brasilapi.com.br/api/taxas/v1");
  });
});

describe("erros", () => {
  it("erro HTTP vira ErroApi com o status", async () => {
    responder({ message: "nao encontrado" }, 404);
    await expect(buscarCep("00000000")).rejects.toBeInstanceOf(ErroApi);
  });

  it("falha de rede vira mensagem amigavel", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network")));
    await expect(buscarTaxas()).rejects.toThrow(/Sem conexao/);
  });

  it("mantem AbortError como esta", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new DOMException("abortado", "AbortError")));
    await expect(buscarTaxas()).rejects.toBeInstanceOf(DOMException);
  });
});

describe("buscarSerieDolar", () => {
  it("ordena cronologicamente e normaliza o valor", async () => {
    responder([
      { bid: "5.90", pctChange: "0", timestamp: "1795095989" },
      { bid: "5.80", pctChange: "-1.2", timestamp: "1794912345" },
    ]);
    const serie = await buscarSerieDolar(30);
    expect(serie).toHaveLength(2);
    expect(serie[0]?.valor).toBe(5.8);
    expect(serie[1]?.valor).toBe(5.9);
    expect(serie[0]?.data && serie[1]?.data && serie[0].data <= serie[1].data).toBe(true);
  });

  it("deriva a data do timestamp quando o endpoint /daily nao manda create_date", async () => {
    // /daily/USD-BRL devolve so timestamp: este era o bug que quebrava a tela
    responder([{ bid: "5.88", pctChange: "0", timestamp: "1795095989" }]);
    const serie = await buscarSerieDolar(30);
    expect(serie[0]?.data).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("prefere create_date quando existe", async () => {
    responder([{ bid: "5.88", pctChange: "0", timestamp: "1", create_date: "2026-11-19 10:46:29" }]);
    const serie = await buscarSerieDolar(30);
    expect(serie[0]?.data).toBe("2026-11-19");
  });

  it("descarta item sem data nem timestamp", async () => {
    responder([{ bid: "5.88", pctChange: "0", timestamp: "0" }, { bid: "5.90", pctChange: "0", timestamp: "1795095989" }]);
    const serie = await buscarSerieDolar(30);
    expect(serie).toHaveLength(1);
  });
});

describe("buscarUltimaCotacao", () => {
  it("mapeia as chaves USDBRL e EURBRL", async () => {
    responder({
      USDBRL: { code: "USD", codein: "BRL", bid: "5.87", pctChange: "-0.13", create_date: "2026-11-19", timestamp: "1" },
      EURBRL: { code: "EUR", codein: "BRL", bid: "6.35", pctChange: "0.2", create_date: "2026-11-19", timestamp: "2" },
    });
    const { USD, EUR } = await buscarUltimaCotacao();
    expect(USD?.bid).toBe("5.87");
    expect(EUR?.bid).toBe("6.35");
  });
});

describe("consultas", () => {
  it("normaliza o CEP antes de consultar", async () => {
    const espiao = responder({ cep: "01310100", state: "SP", city: "Sao Paulo", neighborhood: "", street: "", service: "x" });
    await buscarCep("01310-100");
    expect(espiao.mock.calls[0]?.[0]).toContain("/cep/v2/01310100");
  });

  it("normaliza o CNPJ antes de consultar", async () => {
    const espiao = responder({ cnpj: "19131243000197", razao_social: "X" });
    await buscarCnpj("19.131.243/0001-97");
    expect(espiao.mock.calls[0]?.[0]).toContain("/cnpj/v1/19131243000197");
  });

  it("feriados usam o ano pedido", async () => {
    const espiao = responder([]);
    await buscarFeriados(2027);
    expect(espiao.mock.calls[0]?.[0]).toContain("/feriados/v1/2027");
  });
});

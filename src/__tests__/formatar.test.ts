import { describe, expect, it } from "vitest";
import {
  diasAte,
  formatarCep,
  formatarCnpj,
  formatarData,
  formatarMoeda,
  formatarNumero,
  formatarPercentual,
  variacao,
} from "../lib/formatar";

describe("formatarMoeda", () => {
  it("usa o real brasileiro", () => {
    expect(formatarMoeda(5.88).replace(/\s/g, " ")).toBe("R$ 5,88");
  });

  it("formata milhar", () => {
    expect(formatarMoeda(1234.5).replace(/\s/g, " ")).toBe("R$ 1.234,50");
  });
});

describe("formatarNumero", () => {
  it("usa virgula como decimal", () => {
    expect(formatarNumero(13.75)).toBe("13,75");
  });

  it("sempre mostra duas casas", () => {
    expect(formatarNumero(5)).toBe("5,00");
  });
});

describe("formatarPercentual", () => {
  it("coloca sinal de mais quando positivo", () => {
    expect(formatarPercentual(1.5)).toBe("+1,50%");
  });

  it("mantem o sinal negativo", () => {
    expect(formatarPercentual(-0.42)).toBe("-0,42%");
  });

  it("zero nao ganha sinal", () => {
    expect(formatarPercentual(0)).toBe("0,00%");
  });
});

describe("formatarData", () => {
  it("converte ISO em dd/mm/aaaa", () => {
    expect(formatarData("2026-11-19")).toBe("19/11/2026");
  });

  it("aceita data com hora", () => {
    expect(formatarData("2026-11-19 10:54:20")).toBe("19/11/2026");
  });

  it("devolve a entrada quando nao e data", () => {
    expect(formatarData("nao-e-data")).toBe("nao-e-data");
  });
});

describe("formatarCep", () => {
  it("coloca o hifen", () => {
    expect(formatarCep("01310100")).toBe("01310-100");
  });

  it("ignora caracteres que nao sao digitos", () => {
    expect(formatarCep("01310-100")).toBe("01310-100");
  });
});

describe("formatarCnpj", () => {
  it("aplica a mascara completa", () => {
    expect(formatarCnpj("19131243000197")).toBe("19.131.243/0001-97");
  });
});

describe("diasAte", () => {
  it("conta dias no futuro", () => {
    const hoje = new Date(2026, 10, 19);
    expect(diasAte("2026-11-25", hoje)).toBe(6);
  });

  it("devolve zero para hoje", () => {
    const hoje = new Date(2026, 10, 19);
    expect(diasAte("2026-11-19", hoje)).toBe(0);
  });

  it("devolve negativo para data passada", () => {
    const hoje = new Date(2026, 10, 19);
    expect(diasAte("2026-11-01", hoje)).toBe(-18);
  });
});

describe("variacao", () => {
  it("calcula alta", () => {
    expect(variacao(100, 110)).toBeCloseTo(10);
  });

  it("calcula queda", () => {
    expect(variacao(100, 90)).toBeCloseTo(-10);
  });

  it("devolve zero quando o anterior e zero", () => {
    expect(variacao(0, 50)).toBe(0);
  });
});

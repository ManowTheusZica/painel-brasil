import { describe, expect, it } from "vitest";
import { validarCep, validarCnpj } from "../lib/validar";

describe("validarCep", () => {
  it("aceita 8 digitos", () => {
    expect(validarCep("01310100")).toBe(true);
  });

  it("aceita com mascara", () => {
    expect(validarCep("01310-100")).toBe(true);
  });

  it("rejeita curto", () => {
    expect(validarCep("0131010")).toBe(false);
  });

  it("rejeita com letras", () => {
    expect(validarCep("01310-10A")).toBe(false);
  });
});

describe("validarCnpj", () => {
  it("aceita CNPJ real da Petrobras", () => {
    expect(validarCnpj("33.000.167/0001-01")).toBe(true);
  });

  it("aceita CNPJ do Banco do Brasil", () => {
    expect(validarCnpj("00000000000191")).toBe(true);
  });

  it("rejeita digito verificador errado", () => {
    expect(validarCnpj("33.000.167/0001-02")).toBe(false);
  });

  it("rejeita sequencia repetida", () => {
    expect(validarCnpj("11111111111111")).toBe(false);
  });

  it("rejeita tamanho errado", () => {
    expect(validarCnpj("3300016700010")).toBe(false);
  });

  it("rejeita vazio", () => {
    expect(validarCnpj("")).toBe(false);
  });
});

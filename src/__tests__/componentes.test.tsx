import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ConsultaCep } from "../components/ConsultaCep";
import { Erro, Carregando } from "../components/Estados";
import { GraficoLinha } from "../components/GraficoLinha";
import { KpiCard } from "../components/KpiCard";
import { ListaFeriados } from "../components/ListaFeriados";

vi.mock("../api", () => ({
  buscarCep: vi.fn().mockResolvedValue({
    cep: "01310100", state: "SP", city: "Sao Paulo",
    neighborhood: "Bela Vista", street: "Avenida Paulista", service: "open-cep",
  }),
  buscarCnpj: vi.fn(),
}));

describe("KpiCard", () => {
  it("mostra rotulo, valor e variacao", () => {
    render(<KpiCard rotulo="Dolar" valor="R$ 5,88" variacao={-0.42} detalhe="hoje" />);
    expect(screen.getByText("Dolar")).toBeInTheDocument();
    expect(screen.getByText("R$ 5,88")).toBeInTheDocument();
    expect(screen.getByText("-0,42%")).toBeInTheDocument();
  });

  it("marca variacao positiva com classe alta", () => {
    render(<KpiCard rotulo="Euro" valor="R$ 6,35" variacao={1.2} />);
    expect(screen.getByText("+1,20%")).toHaveClass("alta");
  });

  it("omite variacao quando nao informada", () => {
    const { container } = render(<KpiCard rotulo="Selic" valor="13,75%" />);
    expect(container.querySelector(".kpi-variacao")).toBeNull();
  });
});

describe("GraficoLinha", () => {
  const pontos = [
    { rotulo: "01/11", valor: 5.8 },
    { rotulo: "02/11", valor: 5.9 },
    { rotulo: "03/11", valor: 5.85 },
  ];

  it("desenha a linha e a area", () => {
    const { container } = render(<GraficoLinha pontos={pontos} rotuloAcessivel="teste" />);
    expect(container.querySelectorAll("path")).toHaveLength(2);
  });

  it("mostra min, max e quantidade de pontos", () => {
    render(<GraficoLinha pontos={pontos} rotuloAcessivel="teste" />);
    expect(screen.getByText(/min 5.80/)).toBeInTheDocument();
    expect(screen.getByText(/3 pontos/)).toBeInTheDocument();
  });

  it("avisa quando ha menos de dois pontos", () => {
    render(<GraficoLinha pontos={[{ rotulo: "01/11", valor: 5.8 }]} rotuloAcessivel="teste" />);
    expect(screen.getByText(/Sem dados suficientes/)).toBeInTheDocument();
  });
});

describe("ListaFeriados", () => {
  const feriados = [
    { date: "2026-11-20", name: "Consciencia Negra", type: "national" },
    { date: "2026-12-25", name: "Natal", type: "national" },
    { date: "2026-01-01", name: "Ano novo", type: "national" },
  ];

  it("esconde datas passadas", () => {
    render(<ListaFeriados feriados={feriados} hoje={new Date(2026, 10, 19)} />);
    expect(screen.queryByText("Ano novo")).not.toBeInTheDocument();
  });

  it("mostra contagem de dias", () => {
    render(<ListaFeriados feriados={feriados} hoje={new Date(2026, 10, 19)} />);
    expect(screen.getByText("amanha")).toBeInTheDocument();
    expect(screen.getByText("em 36 dias")).toBeInTheDocument();
  });

  it("avisa quando nao ha feriados futuros", () => {
    render(<ListaFeriados feriados={[]} hoje={new Date(2026, 10, 19)} />);
    expect(screen.getByText(/Nenhum feriado/)).toBeInTheDocument();
  });
});

describe("ConsultaCep", () => {
  it("valida a entrada e habilita o botao", () => {
    render(<ConsultaCep />);
    expect(screen.getByRole("button", { name: "consultar" })).toBeEnabled();
  });

  it("mostra erro para CEP incompleto", async () => {
    const usuario = userEvent.setup();
    render(<ConsultaCep />);
    const campo = screen.getByLabelText("CEP");
    await usuario.clear(campo);
    await usuario.type(campo, "123");
    expect(screen.getByText(/8 digitos/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "consultar" })).toBeDisabled();
  });

  it("consulta o CEP valido e mostra o endereco", async () => {
    const usuario = userEvent.setup();
    render(<ConsultaCep />);
    await usuario.click(screen.getByRole("button", { name: "consultar" }));
    expect(await screen.findByText(/Avenida Paulista/)).toBeInTheDocument();
    expect(screen.getByText(/Sao Paulo \/ SP/)).toBeInTheDocument();
  });
});

describe("estados", () => {
  it("Carregando tem role status", () => {
    render(<Carregando texto="buscando" />);
    expect(screen.getByRole("status")).toHaveTextContent("buscando");
  });

  it("Erro tem role alert e botao de tentar de novo", () => {
    const aoTentar = vi.fn();
    render(<Erro mensagem="falhou" aoTentar={aoTentar} />);
    expect(screen.getByRole("alert")).toHaveTextContent("falhou");
    expect(screen.getByRole("button", { name: "tentar de novo" })).toBeInTheDocument();
  });
});

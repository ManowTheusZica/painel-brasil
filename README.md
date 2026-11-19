# painel-brasil

![CI](https://github.com/ManowTheusZica/painel-brasil/actions/workflows/ci.yml/badge.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![testes](https://img.shields.io/badge/testes-56-brightgreen)

**[painel-brasil-mendes.vercel.app](https://painel-brasil-mendes.vercel.app)** — indicadores
econômicos e consultas públicas em uma página, com dados ao vivo (Selic, CDI, IPCA, dólar,
euro, feriados, CEP e CNPJ).

React 19 + TypeScript em modo estrito, Vite, **zero biblioteca de UI e zero biblioteca de
gráfico** — o gráfico é SVG escrito à mão.

## O que tem

- **5 indicadores ao vivo** — Selic, CDI e IPCA (BrasilAPI) + dólar e euro com variação do dia
- **Gráfico dos últimos 30 dias** em SVG puro, com min/max, escala automática e variação do período
- **Consulta de CEP** e **consulta de CNPJ** com validação real de dígito verificador (algoritmo módulo 11)
- **Próximos feriados** com contagem de dias
- Estados de carregando, erro e "tentar de novo" em cada bloco — cada seção falha sozinha
- Tema escuro, responsivo, sem CDN e sem fonte externa

## O bug que valeu o projeto

A primeira versão subiu para produção e ficou **em branco**. Console limpo, nenhum erro de
rede, `#root` vazio.

Causa: o endpoint `/daily/USD-BRL` da AwesomeAPI devolve **apenas `timestamp`** (segundos
unix) — diferente do `/last`, que traz `create_date`. O código fazia
`cotacao.create_date.slice(0, 10)` e explodia com `Cannot read properties of undefined`,
derrubando a árvore inteira do React antes do primeiro commit.

A correção foi mover a normalização para a borda da API, onde ela pertence:

```ts
function dataDeCotacao(item: Partial<Cotacao>): string {
  if (typeof item.create_date === "string" && item.create_date.length >= 10) {
    return item.create_date.slice(0, 10);
  }
  const segundos = Number(item.timestamp);
  if (!Number.isFinite(segundos) || segundos <= 0) return "";
  return new Date(segundos * 1000).toISOString().slice(0, 10);
}
```

Agora `buscarSerieDolar` devolve `PontoSerie[]` já ordenado, tipado e datado — o componente
não precisa saber que existem dois formatos. E ficou um teste cobrindo exatamente o formato
que quebrou.

## Rodando

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # gera dist/
npm test           # 56 testes
npm run typecheck  # tsc --noEmit (strict)
```

## Testes (56)

| Arquivo | O que cobre |
|---|---|
| `validar.test.ts` | CEP e CNPJ — incluindo o algoritmo módulo 11 e CNPJ de dígito repetido |
| `formatar.test.ts` | moeda, percentual com sinal, data ISO, CEP/CNPJ mascarados, dias até um feriado |
| `api.test.ts` | parsing, normalização da série, erro HTTP → `ErroApi`, falha de rede, `AbortError` preservado |
| `componentes.test.tsx` | KPI, gráfico (pontos e casos de borda), lista de feriados filtrando passado, formulário de CEP |

Nenhum teste toca a internet: `fetch` é substituído por `vi.stubGlobal`.

## Decisões que valem explicar

- **`strict` + `noUncheckedIndexedAccess`**: acesso a índice de array devolve `T | undefined`. O
  TypeScript obrigou a tratar o caso de lista vazia — foi assim que o gráfico ganhou a
  mensagem "sem dados suficientes" em vez de renderizar uma linha quebrada.
- **Gráfico em SVG, não em biblioteca**: 60 linhas de `path` resolvem o problema. Trocar
  isso por uma dependência de 300 KB não faria o gráfico melhor, só faria o site mais lento.
- **`useApi` com `AbortController`**: se o componente desmonta (ou o usuário clica em
  atualizar), a requisição anterior é abortada. Sem isso, uma resposta lenta sobrescreve a
  mais recente.
- **Cada bloco com seu próprio estado**: se o CNPJ cair, os indicadores continuam na tela.
  Um `try` global transformaria uma falha parcial em página em branco.
- **Normalização na borda**: a regra "dois formatos de data" morre dentro de `api.ts` e não
  vaza para o JSX. É o que evita o bug que já aconteceu.

## Limitações

- Sem cache: cada `atualizar` bate na API de novo. Cache com `stale-while-revalidate`
  seria o próximo passo.
- Sem testes E2E (Playwright) — a cobertura é de unidade e componente.
- Depende de API pública sem SLA; se a BrasilAPI cair, o painel mostra o erro em vez de dado velho.

## Licença

MIT.

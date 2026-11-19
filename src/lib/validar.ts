export function validarCep(entrada: string): boolean {
  const limpo = entrada.replace(/\D/g, "");
  return limpo.length === 8;
}

/** Valida CNPJ pelo algoritmo oficial (modulo 11, pesos 2..9 e 2..9 voltando). */
export function validarCnpj(entrada: string): boolean {
  const limpo = entrada.replace(/\D/g, "");
  if (limpo.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(limpo)) return false;

  const calcular = (base: string): number => {
    let peso = base.length - 7;
    let soma = 0;
    for (const caractere of base) {
      soma += Number(caractere) * peso;
      peso -= 1;
      if (peso < 2) peso = 9;
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const primeiro = calcular(limpo.slice(0, 12));
  if (primeiro !== Number(limpo[12])) return false;
  const segundo = calcular(limpo.slice(0, 13));
  return segundo === Number(limpo[13]);
}

export function formatarData(data, locale = "pt-BR") {
  const d = data instanceof Date ? data : new Date(data);
  return d.toLocaleDateString(locale);
}

export function formatarDataHora(data, locale = "pt-BR") {
  const d = data instanceof Date ? data : new Date(data);
  return d.toLocaleString(locale);
}

export function inicioDoDia(data = new Date()) {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function fimDoDia(data = new Date()) {
  const d = new Date(data);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function ultimosNDias(n = 7) {
  const dias = [];
  const hoje = inicioDoDia(new Date());

  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() - i);
    dias.push(d);
  }

  return dias;
}

export function agruparPorDia(lista, campoData = "data") {
  return lista.reduce((acc, item) => {
    const data = new Date(item[campoData]);
    const chave = data.toISOString().slice(0, 10);
    if (!acc[chave]) acc[chave] = [];
    acc[chave].push(item);
    return acc;
  }, {});
}

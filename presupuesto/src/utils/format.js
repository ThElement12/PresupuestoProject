const rdFormatter = new Intl.NumberFormat('es-DO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usdFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatRD(amount) {
  return `RD$ ${rdFormatter.format(amount)}`;
}

export function formatUSD(amount) {
  return `US$ ${usdFormatter.format(amount)}`;
}

export function formatNumber(amount) {
  return rdFormatter.format(amount);
}

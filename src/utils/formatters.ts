const wholeNumberFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

const fractionalNumberFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
});

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

const getSafeNumber = (value: number) => (Number.isFinite(value) ? Math.max(0, value) : 0);

export const formatNumber = (value: number) => wholeNumberFormatter.format(getSafeNumber(value));

export const formatDecimal = (
  value: number,
  {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  }: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {},
) =>
  new Intl.NumberFormat(undefined, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(getSafeNumber(value));

export const formatByteSize = (bytes: number): string => {
  let size = getSafeNumber(bytes);
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < BYTE_UNITS.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const formatter = unitIndex === 0 ? wholeNumberFormatter : fractionalNumberFormatter;

  return `${formatter.format(size)} ${BYTE_UNITS[unitIndex]}`;
};

export const formatCountLabel = (
  count: number,
  singularLabel: string,
  pluralLabel = `${singularLabel}s`,
) => `${formatNumber(count)} ${count === 1 ? singularLabel : pluralLabel}`;

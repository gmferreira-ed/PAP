

export function JustifyLine(parts: string[], lineWidth: number = 42): string {
  const totalTextLength = parts.reduce((sum, part) => sum + part.length, 0);
  const totalSpaces = lineWidth - totalTextLength;

  if (totalSpaces < 0) {
    throw 'Invalid content fit'
  }

  const gaps = parts.length - 1;
  const evenSpace = gaps > 0 ? Math.floor(totalSpaces / gaps) : 0;
  const extra = gaps > 0 ? totalSpaces % gaps : 0;

  let result = '';
  for (let i = 0; i < parts.length; i++) {
    result += parts[i];
    if (i < gaps) {
      const spacesToAdd = evenSpace + (i < extra ? 1 : 0);
      result += ' '.repeat(spacesToAdd);
    }
  }

  console.log(result.length)
  return result;
}



export function FormatPrice(price: number | string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(Number(price));
}


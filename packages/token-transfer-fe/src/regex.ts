export const isInputDigit = (value: string) => /^(\d*(\.\d*)?|\.\d+)$/.test(value);
export const isDigit = (value: string) => /^\d+(\.\d+)?$/.test(value);
export const isMaxDecimals = (value: string, maxDecimals: number) =>
  new RegExp(`^\\d+(\\.\\d{0,${maxDecimals}})?$`).test(value);

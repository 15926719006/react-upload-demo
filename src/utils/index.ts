// 生成唯一的ID
export const generateUniqueId = (symbol?: string) => {
  return `_${symbol}` + Math.random().toString(36).substring(2, 9);
}
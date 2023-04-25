export const chunk = <T>(arr: readonly T[], chunkSize: number): T[][] => {
  const result = []
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize))
  }

  return result
}

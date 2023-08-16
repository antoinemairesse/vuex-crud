function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function isArray<T>(arr: unknown): arr is Array<T> {
  return Array.isArray(arr)
}

export { capitalizeFirstLetter, isArray }

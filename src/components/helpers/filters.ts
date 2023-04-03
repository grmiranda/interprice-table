export const onlyUnique = (
  value: unknown,
  index: number,
  array: Array<unknown>
) => {
  return array.indexOf(value) === index
}

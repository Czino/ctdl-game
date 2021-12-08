export const getBlockSubsidy = height => {
  let subsidy = 50 * 100000000
  let epoch = (height / 210000) - 1

  if (epoch >= 64) return 0

  for (let h = 0; h < epoch; h++) subsidy /= 2
  return subsidy
}

export default getBlockSubsidy
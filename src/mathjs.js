/* global Benchmark */
import math from 'mathjs'

export const runMathjs = (n) => {
  const a = math.zeros(n, n)
  const b = math.zeros(n, n)
  for (let i = 0; i < n; ++i) {
    for (let j = 0; j < n; ++j) {
      a.set([i, j], Math.random())
      b.set([i, j], Math.random())
    }
  }

  return new Benchmark.Suite()
    .add('mathjs', () => {
      math.multiply(a, b)
    })
    .run()
}

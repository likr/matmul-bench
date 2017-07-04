/* global Benchmark */
import zeros from 'zeros'
import ops from 'ndarray-ops'
import gemm from 'ndarray-gemm'

export const runScijs = (n) => {
  const a = zeros([n, n])
  const b = zeros([n, n])
  const c = zeros([n, n])

  ops.random(a)
  ops.random(b)

  return new Benchmark.Suite()
    .add('scijs', () => {
      gemm(c, a, b)
    })
    .run()
}

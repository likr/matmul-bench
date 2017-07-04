/* global Benchmark */
/* global WebAssembly */
import linalgModule from 'linalg-asm'

export const runLinalg = (n) => {
  const heap = new ArrayBuffer(24 * n * n)
  const linalg = linalgModule(global, null, heap)
  const a = new Float64Array(heap, 0, n * n)
  const b = new Float64Array(heap, 8 * n * n, n * n)
  const c = new Float64Array(heap, 16 * n * n, n * n)

  for (let i = 0; i < n; ++i) {
    for (let j = 0; j < n; ++j) {
      a[i * n + j] = Math.random()
      b[i * n + j] = Math.random()
      c[i * n + j] = 0.0
    }
  }

  return new Benchmark.Suite()
    .add('linalg-asmjs', () => {
      linalg.dgemm(0, 0, n, n, n, 1.0, a.byteOffset, n, b.byteOffset, n, 0.0, c.byteOffset, n)
    })
    .run()
}

export const runLinalgWasm = (linalgModule, n) => {
  const memory = new WebAssembly.Memory({
    initial: 256,
    maximum: 256
  })
  const linalg = new WebAssembly.Instance(linalgModule, {
    env: {
      memory,
      table: new WebAssembly.Table({
        initial: 0,
        maximum: 0,
        element: 'anyfunc'
      }),
      memoryBase: 0,
      tableBase: 0
    }
  })

  const heap = memory.buffer
  const a = new Float64Array(heap, 0, n * n)
  const b = new Float64Array(heap, 8 * n * n, n * n)
  const c = new Float64Array(heap, 16 * n * n, n * n)

  for (let i = 0; i < n; ++i) {
    for (let j = 0; j < n; ++j) {
      a[i * n + j] = Math.random()
      b[i * n + j] = Math.random()
      c[i * n + j] = 0.0
    }
  }

  return new Benchmark.Suite()
    .add('linalg-wasm', () => {
      linalg.exports.dgemm(0, 0, n, n, n, 1.0, a.byteOffset, n, b.byteOffset, n, 0.0, c.byteOffset, n)
    })
    .run()
}

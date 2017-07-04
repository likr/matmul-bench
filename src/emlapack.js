/* global Benchmark */
import asmjsModule from 'emlapack/asmjs'
import wasmModule from 'emlapack/wasm'

export const runEmlapack = (wasm, n) => {
  const emlapack = wasm ? wasmModule : asmjsModule
  const label = wasm ? 'emlapack-wasm' : 'emlapack-asmjs'
  const ptransa = emlapack._malloc(1)
  const ptransb = emlapack._malloc(1)
  const pm = emlapack._malloc(4)
  const pn = emlapack._malloc(4)
  const pk = emlapack._malloc(4)
  const palpha = emlapack._malloc(8)
  const pa = emlapack._malloc(8 * n * n)
  const plda = emlapack._malloc(4)
  const pb = emlapack._malloc(8 * n * n)
  const pldb = emlapack._malloc(4)
  const pbeta = emlapack._malloc(8)
  const pc = emlapack._malloc(8 * n * n)
  const pldc = emlapack._malloc(4)

  emlapack.setValue(ptransa, 'N'.charCodeAt(0), 'i8')
  emlapack.setValue(ptransb, 'N'.charCodeAt(0), 'i8')
  emlapack.setValue(pm, n, 'i32')
  emlapack.setValue(pn, n, 'i32')
  emlapack.setValue(pk, n, 'i32')
  emlapack.setValue(palpha, 1.0, 'double')
  emlapack.setValue(plda, n, 'i32')
  emlapack.setValue(pldb, n, 'i32')
  emlapack.setValue(pbeta, 0.0, 'double')
  emlapack.setValue(pldc, n, 'i32')

  const a = new Float64Array(emlapack.HEAPF64.buffer, pa, n * n)
  const b = new Float64Array(emlapack.HEAPF64.buffer, pb, n * n)
  const c = new Float64Array(emlapack.HEAPF64.buffer, pc, n * n)
  for (let i = 0; i < n; ++i) {
    for (let j = 0; j < n; ++j) {
      a[i * n + j] = Math.random()
      b[i * n + j] = Math.random()
      c[i * n + j] = 0.0
    }
  }

  const dgemm = emlapack.cwrap('f2c_dgemm', null, ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number'])
  return new Benchmark.Suite()
    .add(label, () => {
      dgemm(ptransa, ptransb, pm, pn, pk, palpha, pa, plda, pb, pldb, pbeta, pc, pldc)
    })
    .run()
}

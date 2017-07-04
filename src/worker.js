/* eslint-env worker */
/* global WebAssembly */

importScripts('https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js')
importScripts('https://cdnjs.cloudflare.com/ajax/libs/platform/1.3.4/platform.min.js')
importScripts('https://cdnjs.cloudflare.com/ajax/libs/benchmark/2.1.4/benchmark.min.js')

import 'babel-polyfill'
import wasmModule from 'emlapack/wasm'
import {runEmlapack} from './emlapack'
import {runLinalg, runLinalgWasm} from './linalg'
import {runMathjs} from './mathjs'
import {runScijs} from './scijs'

const loadEmlapackWasm = () => {
  return new Promise((resolve, reject) => {
    const intervalID = setInterval(() => {
      if (wasmModule.usingWasm) {
        clearInterval(intervalID)
        resolve()
      }
    }, 100)
  })
}

const loadLinalgWasm = () => {
  return fetch('./linalg.wasm')
    .then((response) => response.arrayBuffer())
    .then((bytes) => WebAssembly.compile(bytes))
}

const loadWasm = () => {
  return Promise
    .all([
      loadEmlapackWasm(),
      loadLinalgWasm()
    ])
    .then(([_, linalgModule]) => linalgModule)
}

const sendResult = (results) => {
  postMessage({
    type: 'result',
    results: results.map((result) => {
      delete result.compiled
      delete result.fn
      return result
    })
  })
}

onmessage = (e) => {
  const n = e.data[0]
  postMessage({
    type: 'start',
    cases: 6
  })
  loadWasm().then((linalgModule) => {
    sendResult(runEmlapack(true, n))
    sendResult(runEmlapack(false, n))
    sendResult(runLinalgWasm(linalgModule, n))
    sendResult(runLinalg(n))
    sendResult(runScijs(n))
    sendResult(runMathjs(n))
    postMessage({
      type: 'finish'
    })
  })
}

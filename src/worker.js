/* eslint-env worker */
importScripts('https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js')
importScripts('https://cdnjs.cloudflare.com/ajax/libs/platform/1.3.4/platform.min.js')
importScripts('https://cdnjs.cloudflare.com/ajax/libs/benchmark/2.1.4/benchmark.min.js')

import 'babel-polyfill'
import wasmModule from 'emlapack/wasm'
import {runEmlapack} from './emlapack'
import {runLinalg} from './linalg'
import {runMathjs} from './mathjs'
import {runScijs} from './scijs'

const loadWasm = () => {
  return new Promise((resolve, reject) => {
    const intervalID = setInterval(() => {
      if (wasmModule.usingWasm) {
        clearInterval(intervalID)
        resolve()
      }
    }, 100)
  })
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
    cases: 5
  })
  loadWasm().then(() => {
    sendResult(runEmlapack(true, n))
    sendResult(runEmlapack(false, n))
    sendResult(runLinalg(n))
    sendResult(runMathjs(n))
    sendResult(runScijs(n))
    postMessage({
      type: 'finish'
    })
  })
}

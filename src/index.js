import 'babel-polyfill'

const writeResult = (results, n) => {
  const table = document.getElementById('result')
  results.forEach((result) => {
    const name = document.createElement('td')
    name.innerHTML = result.name
    const mean = document.createElement('td')
    mean.innerHTML = (result.stats.mean * 1000).toFixed(3)
    const count = document.createElement('td')
    count.innerHTML = result.count
    const flops = document.createElement('td')
    flops.innerHTML = ((n * n * (2 * n + 3)) / (10 ** 9) / result.stats.mean).toFixed(3)
    const row = document.createElement('tr')
    row.appendChild(name)
    row.appendChild(mean)
    row.appendChild(flops)
    row.appendChild(count)
    table.appendChild(row)
  })
}

const n = 100
for (const e of document.querySelectorAll('.n')) {
  e.innerHTML = n
}

const startButton = document.getElementById('start-button')
startButton.addEventListener('click', () => {
  if (!window.WebAssembly) {
    window.alert('This benchmark requires WebAssembly support')
    return
  }
  startButton.disabled = true
  let cases = 0
  let finished = 0
  const status = document.getElementById('status')

  const worker = new window.Worker('worker.js')
  worker.onmessage = (e) => {
    switch (e.data.type) {
      case 'start':
        cases = e.data.cases
        status.innerHTML = `running (${finished} / ${cases})`
        status.className = 'running'
        break
      case 'result':
        finished += 1
        status.innerHTML = `running (${finished} / ${cases})`
        writeResult(e.data.results, n)
        break
      case 'finish':
        status.innerHTML = 'done'
        status.className = 'done'
        break
    }
  }

  worker.postMessage([n])
})

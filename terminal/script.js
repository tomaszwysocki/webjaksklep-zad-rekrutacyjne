const inputElement = document.querySelector('.prompt-input')
const outputElement = document.querySelector('.output')
const hints = document.querySelector('.prompt-hints')

let terminalHistory = ['']
let historyIdx = 0
let isFunctionRunning = false

const addLine = text => {
  const line = document.createElement('div')
  line.classList.add('line')
  line.innerText = text
  outputElement.appendChild(line)
}

const setDate = () => {
  const date = new Date()
  const weekDay = date.toLocaleString('default', { weekday: 'short' })
  const day = date.getDate()
  const month = date.toLocaleString('default', { month: 'short' })
  const year = date.getFullYear()
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const dateTime = `${weekDay}, ${day} ${month} ${year} ${hours}:${minutes}:${seconds}`
  const output = `Last login: ${dateTime} GMT`
  addLine(output)
}

const setInitialOutput = () => {
  setDate()
  addLine('you: hello')
  addLine('terminal: Hello :)')
}

const clear = () => {
  outputElement.innerHTML = ''
}

const help = () => {
  return Object.keys(ALL_COMMANDS).join(', ')
}

const quote = async () => {
  const res = await fetch('https://dummyjson.com/quotes/random')
  const { quote, author } = await res.json()
  return `${quote} ~ ${author}`
}

const double = x => {
  if (isNaN(x)) {
    return 'double takes one number as an argument'
  }

  return +x * 2
}

const CUSTOM_COMMANDS = {
  hello: {
    msg: `Hello :)`
  }
}

const COMMANDS = {
  clear: () => clear(),
  help: () => help(),
  quote: () => quote(),
  double: x => double(x)
}

const ALL_COMMANDS = { ...COMMANDS, ...CUSTOM_COMMANDS }

const handleNotFuncCmd = cmd => {
  if ('msg' in cmd) {
    return cmd['msg']
  }

  const property = Object.keys(cmd)[0]
  return cmd[property]
}

const handleUpDownArrows = event => {
  event.preventDefault()

  if (event.key === 'ArrowUp') {
    if (historyIdx === 0) {
      return
    }
    historyIdx--
  }

  if (event.key === 'ArrowDown') {
    if (historyIdx === terminalHistory.length - 1) {
      return
    }
    historyIdx++
  }

  event.target.value = terminalHistory[historyIdx]
  const inputLength = event.target.value.length
  inputElement.setSelectionRange(inputLength, inputLength)
}

const handleHints = event => {
  const input = event.target.value.trim().split(' ')[0]

  if (input === '') {
    hints.innerText = ''
    return
  }

  for (cmd of Object.keys(ALL_COMMANDS)) {
    if (cmd.startsWith(input)) {
      hints.innerText = cmd
      return
    }
  }
  hints.innerText = ''
}

const handleInput = async event => {
  if (event.key === 'Enter') {
    if (isFunctionRunning) {
      return
    }

    const commands = Object.keys(ALL_COMMANDS)
    let found = false
    const input = event.target.value
      .trim()
      .split(' ')
      .filter(elem => elem !== '')
    const [inputCmd, ...inputArgs] = input

    if (input.length === 0) {
      return
    }

    isFunctionRunning = true
    terminalHistory.splice(-1, 0, input.join(' '))
    event.target.value = ''
    hints.innerText = ''

    for (const cmd of commands) {
      if (inputCmd === cmd) {
        if (inputCmd === 'clear') {
          ALL_COMMANDS.clear()
          found = true
          break
        }

        addLine(`you: ${input.join(' ')}`)

        if (typeof ALL_COMMANDS[inputCmd] !== 'function') {
          const cmdOutput = handleNotFuncCmd(ALL_COMMANDS[inputCmd])
          addLine(`terminal: ${cmdOutput}`)
          found = true
          break
        }

        const cmdOutput = await ALL_COMMANDS[inputCmd](...inputArgs)
        addLine(`terminal: ${cmdOutput}`)
        found = true
        break
      }
    }

    if (!found) {
      addLine(`terminal: command not found: ${inputCmd}`)
    }

    historyIdx = terminalHistory.length - 1
    outputElement.scrollTop = outputElement.scrollHeight
    isFunctionRunning = false
    return
  }

  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    handleUpDownArrows(event)
    handleHints(event)
    return
  }
}

setInitialOutput()
inputElement.addEventListener('keydown', handleInput)
inputElement.addEventListener('input', handleHints)

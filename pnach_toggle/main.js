import blessed from 'blessed'
import fs from 'fs'

if (process.argv.length !== 3) {
  console.log('Usage:')
  console.log('node main.js file.pnach')
  process.exit(1)
}

const file = process.argv[2]

if (!fs.existsSync(file)) {
  console.error('File not found.')
  process.exit(1)
}

const original = fs.readFileSync(file, 'utf8')

const lines = original.split(/\r?\n/)

const cheats = []

let searching = false

let current = null

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]

  const m = line.match(/^\[(.+)]$/)

  if (m) {
    if (current) current.end = i - 1

    current = {
      name: m[1],
      author: '',
      description: '',
      start: i,
      end: lines.length - 1,
      enabled: false
    }

    cheats.push(current)

    continue
  }

  if (!current) continue

  if (/^patch=/.test(line)) current.enabled = true
  if (/^author=/.test(line)) current.author = line.substring(7)

  if (/^description=/.test(line)) current.description = line.substring(12)

  if (/^patch=/.test(line)) current.enabled = true
}

let filteredCheats = [...cheats]
let filterText = ''

if (current) current.end = lines.length - 1
const screen = blessed.screen({
  smartCSR: true,
  title: 'PNACH Cheat Manager'
})

const list = blessed.list({
  parent: screen,
  tags: true,

  left: 0,
  top: 0,

  width: '45%',
  height: '100%-1',

  border: 'line',
  label: ' Cheats ',

  keys: true,
  mouse: true,
  vi: true,

  style: {
    selected: {
      bg: 'blue'
    }
  }
})

const info = blessed.box({
  parent: screen,

  left: '45%',
  top: 0,

  width: '55%',
  height: '100%-1',

  border: 'line',
  label: ' Cheat Info ',

  tags: true,
  scrollable: true,

  padding: {
    left: 1,
    right: 1
  }
})

const help = blessed.box({
  parent: screen,

  bottom: 0,

  width: '100%',
  height: 1,

  tags: true,

  style: {
    bg: 'blue',
    fg: 'white'
  }
})

function updateInfo() {
  const cheat = filteredCheats[list.selected]

  if (!cheat) return

  info.setContent(
    `{bold}${cheat.name}{/bold}

{yellow-fg}Author:{/yellow-fg}
${cheat.author || 'Unknown'}

{yellow-fg}Description:{/yellow-fg}
${cheat.description || 'No description.'}`
  )

  screen.render()
}

list.on('keypress', () => {
  setImmediate(updateInfo)
})

function refresh() {
  const selected = list.selected

  list.setItems(
    filteredCheats.map((c) =>
      c.enabled
        ? `{green-fg}[+]{/green-fg} ${c.name}`
        : `{red-fg}[-]{/red-fg} ${c.name}`
    )
  )

  list.select(Math.min(selected, cheats.length - 1))

  updateInfo()

  screen.render()
}

refresh()
updateInfo()

list.focus()

list.key('space', () => {
  if (searching) return
  const index = list.selected
  const cheat = filteredCheats[index]

  cheat.enabled = !cheat.enabled

  list.setItem(
    index,
    cheat.enabled
      ? `{green-fg}[+]{/green-fg} ${cheat.name}`
      : `{red-fg}[-]{/red-fg} ${cheat.name}`
  )

  updateInfo()

  screen.render()
})

list.key('a', () => {
  if (searching) return
  filteredCheats.forEach((cheat, i) => {
    cheat.enabled = true

    list.setItem(i, `{green-fg}[+]{/green-fg} ${cheat.name}`)
  })

  screen.render()
})

list.key('d', () => {
  if (searching) return
  filteredCheats.forEach((cheat, i) => {
    cheat.enabled = false

    list.setItem(i, `{red-fg}[-]{/red-fg} ${cheat.name}`)
  })

  screen.render()
})

list.key(['enter'], () => {
  if (searching) {
    searching = false

    showHelp()

    screen.render()
    return
  }
  for (const cheat of cheats) {
    for (let j = cheat.start; j <= cheat.end; j++) {
      let line = lines[j]

      if (cheat.enabled) {
        line = line.replace(/^(\s*)\/\/\s*patch=/, '$1patch=')
      } else {
        line = line.replace(/^(\s*)patch=/, '$1//patch=')
      }

      lines[j] = line
    }
  }

  fs.writeFileSync(file, lines.join('\n'))

  screen.destroy()

  console.log('Saved.')
})

function showHelp() {
  help.setContent(
    '{bold}↑↓{/bold} Move   ' +
      '{bold}Space{/bold} Toggle   ' +
      '{bold}/{/bold} Search   ' +
      '{bold}A{/bold} Enable All   ' +
      '{bold}D{/bold} Disable All   ' +
      '{bold}Enter{/bold} Save   ' +
      '{bold}Esc{/bold} Exit'
  )
}

function showSearch() {
  help.setContent(`{bold}Search:{/bold} ${filterText}█`)
}

showHelp()

function applyFilter() {
  if (filterText === '') {
    filteredCheats = [...cheats]
  } else {
    filteredCheats = cheats.filter(
      (c) =>
        c.name.toLowerCase().includes(filterText) ||
        c.author.toLowerCase().includes(filterText) ||
        c.description.toLowerCase().includes(filterText)
    )
  }

  refresh()
}

screen.key('/', () => {
  if (searching) return

  searching = true

  showSearch()

  screen.render()
})

screen.on('keypress', (ch, key) => {
  if (!searching) return

  if (key.name === 'escape') return

  if (key.name === 'enter') {
    return
  }

  if (key.name === 'backspace') {
    filterText = filterText.slice(0, -1)
  } else if (ch && ch.length === 1) {
    filterText += ch.toLowerCase()
  }

  applyFilter()

  showSearch()

  screen.render()
})

screen.key('escape', () => {
  if (searching) {
    if (filterText !== '') {
      filterText = ''

      applyFilter()

      showSearch()
    } else {
      searching = false

      showHelp()
    }

    screen.render()

    return
  } else {
    if (filterText !== '') {
      filterText = ''

      applyFilter()
      return
    }
  }

  screen.destroy()
})

screen.render()

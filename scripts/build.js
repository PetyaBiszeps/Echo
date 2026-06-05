// import { spawn } from 'node:child_process'

// Constants
const commands = [{
  name: 'client',
  cmd: 'pnpm --filter @echo/client build'
}, {
  name: 'server',
  cmd: 'pnpm --filter @echo/server build'
}, {
  name: 'shared',
  cmd: 'pnpm --filter @echo/shared build'
}]
// const children = []

// Init
commands.forEach(({ name, cmd }) => {
  console.log(`[${name}] ${cmd}`)
})

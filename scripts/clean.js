// import { spawn } from 'node:child_process'

// Constants
const commands = [{
  name: 'client',
  cmd: 'pnpm --filter @echo/client clean'
}, {
  name: 'server',
  cmd: 'pnpm --filter @echo/server clean'
}, {
  name: 'shared',
  cmd: 'pnpm --filter @echo/shared clean'
}]
// const children = []

// Init
commands.forEach(({ name, cmd }) => {
  console.log(`[${name}] ${cmd}`)
})

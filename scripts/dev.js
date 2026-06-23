import { spawn } from 'node:child_process'

// Constants
const shouldRunStudio = process.argv.includes('--studio')
const commands = [{
  name: 'docker',
  cmd: 'docker compose -f docker-compose.dev.yml up -d'
}, {
  name: 'client',
  cmd: 'pnpm --filter @echo/client dev'
}, {
  name: 'server',
  cmd: 'pnpm --filter @echo/server dev'
}, ...(shouldRunStudio ? [{
  name: 'prisma',
  cmd: 'pnpm --filter @echo/server exec prisma studio',
  persistent: true
}] : [])]
const children = []

// Init
commands.forEach(({ name, cmd, persistent }) => {
  const child = spawn(cmd, {
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe']
  })

  children.push({
    name: name,
    child: child,
    persistent: persistent
  })

  child.stdout.on('data', (data) => {
    process.stdout.write(`[${name}] ${data}`)
  })

  child.stderr.on('data', data => {
    process.stderr.write(`[${name} ERROR] ${data}`)
  })

  child.on('close', code => {
    console.log(`[${name}] exited with code ${code}`)

    if (persistent && code !== 0) {
      process.exitCode = code ?? 1
    }
  })
})

process.on('SIGINT', () => {
  console.log('Shutting down all dev processes...')

  children.forEach(({ child }) => {
    if (!child.killed) {
      child.kill('SIGINT')
    }
  })
  process.exit()
})

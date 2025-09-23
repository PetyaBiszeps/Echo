// import { spawn } from 'node:child_process'

// Constants
const commands = [{
    name: 'client',
    cmd: 'yarn workspace @echo/client clean'
}, {
    name: 'server',
    cmd: 'yarn workspace @echo/server clean'
}, {
    name: 'shared',
    cmd: 'yarn workspace @echo/shared clean'
}]
// const children = []

// Init
commands.forEach(({ name, cmd }) => {
    console.log(`[${name}] ${cmd}`)
})
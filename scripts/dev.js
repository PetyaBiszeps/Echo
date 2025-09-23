import { spawn } from 'node:child_process'

    // Constants
const commands = [{
    name: 'docker',
    cmd: 'docker compose -f docker-compose.dev.yml up -d'
}, {
    name: 'client',
    cmd: 'yarn workspace @echo/client dev'
}, {
    name: 'server',
    cmd: 'yarn workspace @echo/server dev'
}, {
    name: 'prisma',
    cmd: 'yarn workspace @echo/server prisma studio'
}]
const children = []

    // Init
commands.forEach(({ name, cmd }) => {
    const child = spawn(cmd, {
        shell: true
    })
    children.push(child)

    child.stdout.on('data', (data) => {
        process.stdout.write(`[${name}] ${data}`);
    })

    child.stderr.on("data", data => {
        process.stderr.write(`[${name} ERROR] ${data}`);
    })

    child.on("close", code => {
        console.log(`[${name}] exited with code ${code}`);
    })
})

process.on("SIGINT", () => {
    console.log("Shutting down all dev processes...")
    children.forEach(item => item.kill("SIGINT"))

    process.exit()
})
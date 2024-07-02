const { spawn } = require('child_process');

let sp = null;

process.on('message', (m) => {
    console.log("command", m);
    if (m.type === "RUN") {
        const command = m.command.split(" ")
        sp = spawn(command[0], command.slice(1));

        sp.stdout.on('data', (data) => {
            process.send({ type: "STDOUT", message: data.toString() })
        });

        sp.stderr.on('data', (data) => {
            process.send({ type: "STDERR", message: data.toString() })
        });

        sp.on('close', (code) => {
            process.send({ type: "CLOSE", message: code })
        });
    }

    if (m.type === "KILL") {
        sp.kill()
    }

});
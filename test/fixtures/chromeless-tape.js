const path = require('path');
const http = require('http');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

const {test, teardown} = require('tap');

const {Chromeless} = require('chromeless');

const indexHTML = path.relative(
    path.join(__dirname, '../..'),
    path.join(__dirname, 'chromeless-tape.html')
);

let server;
let chromeless;

const miniServer = function (port = 8000) {
    const server = http.createServer(async function (req, res) {
        try {
            const fullPath = path.join(__dirname, '../..', req.url);
            res.end(await readFile(fullPath));
        } catch (e) {
            res.statusCode = 404;
            res.end();
        }
    });
    server.ready = new Promise(function (resolve) {
        server.on('listening', function () {
            resolve(server.address());
        });
    });
    server.on('error', function (e) {
        if (e.code === 'EADDRINUSE') {
            server.listen(0);
        } else {
            console.erro(e.stack || e.message || e.toString());
            process.exit(1);
        }
    });
    server.listen(port);
    return server;
};

module.exports = function (name, func) {
    if (typeof name === 'function') {
        func = name;
        name = func.name;
    }

    if (!chromeless) {
        server = miniServer();
        chromeless = new Chromeless();
        teardown(async function () {
            try {
                await Promise.race([
                    new Promise(resolve => setTimeout(resolve, 1000)),
                    new Promise(resolve => {
                        chromeless.queue.chrome.chromeInstance.process
                            .on('exit', resolve);
                        chromeless.end();
                    })
                ]);
                process.exit(0);
            } catch (e) {
                console.error(e);
            }
        });
    }

    test(name, async function (t) {
        const {port} = await server.ready;
        await chromeless.goto(`http://localhost:${port}/${indexHTML}`)
            .wait('.loaded');
        try {
            await func(t, chromeless);
        } catch (e) {
            console.error(e);
        }
        await chromeless.goto(`about:blank`);
        t.end();
    });
};

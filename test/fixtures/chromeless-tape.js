const path = require('path');
const http = require('http');
const fs = require('fs');
const util = require('util');
const {createHash} = require('crypto');
const readFile = util.promisify(fs.readFile);

const {test, teardown} = require('tap');

const {Chromeless} = require('chromeless');

const pathRoot = (...args) => path.join(__dirname, '../..', ...args);

const indexHTML = path.relative(
    path.join(__dirname, '../..'),
    path.join(__dirname, 'chromeless-tape.html')
);

let server;
let chromeless;

const miniServer = function (port = 8000) {
    const fileCache = {};

    function loadFile (fullPath) {
        if (!fileCache[fullPath]) {
            fileCache[fullPath] = readFile(fullPath)
                .then(buffer => ({
                    etag: createHash('md5')
                        .update(buffer)
                        .digest().base64Slice(),
                    buffer
                }));
        }
    }

    const server = http.createServer(async function (req, res) {
        try {
            const fullPath = path.join(__dirname, '../..', req.url);
            try {
                loadFile(fullPath);
                await fileCache[fullPath];
            } catch (e) {
                res.statusCode = 404;
                res.end();
            }

            const {etag, buffer} = await fileCache[fullPath];
            res.setHeader('etag', etag);
            res.setHeader('cache-control', 'max-age=30');
            if (req.headers['if-none-match'] === etag) {
                res.statusCode = 304;
            } else {
                res.write(buffer);
            }
            res.end();
        } catch (e) {
            res.statusCode = 500;
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
                        if (chromeless.queue.chrome.chromeInstance.process) {
                            chromeless.queue.chrome.chromeInstance.process
                                .on('exit', resolve);
                        }
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

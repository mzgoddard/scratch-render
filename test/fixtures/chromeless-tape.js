const path = require('path');
const http = require('http');
const fs = require('fs');
const util = require('util');
const {createHash} = require('crypto');
const readFile = util.promisify(fs.readFile);

const {test, teardown} = require('tap');
// const nyc = require('nyc');
const {createInstrumenter} = require('nyc/node_modules/istanbul-lib-instrument');
const convertSourceMap = require('convert-source-map');
const mergeSourceMap = require('merge-source-map');

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

    let _instrumenter = null;

    async function instrument (buffer, fullPath) {
        if (fullPath.endsWith('scratch-render.js')) {
            const source = buffer.toString();
            const sourceMap = JSON.parse(fs.readFileSync(fullPath + '.map').toString());
            return source;
            try {
                if (!_instrumenter) {
                    _instrumenter = createInstrumenter({
                        autoWrap: true,
                        coverageVariable: '__coverage__',
                        embedSource: true,
                        // compact: false,
                        // preserveComments: false,
                        produceSourceMap: true,
                        // ignoreClassMethods: false,
                        // esModules: false

                        // ...configPlugins
                        // preserveComments: options.preserveComments,
                        // produceSourceMap: options.produceSourceMap,
                        // ignoreClassMethods: options.ignoreClassMethods,
                        // esModules: options.esModules,
                        // ...configPlugins
                    });
                }
                // console.log(_instrumenter.constructor.name);
                let instrumented = _instrumenter.instrumentSync(source, path.relative(pathRoot(), fullPath));
                if (sourceMap) {
                    let lastSourceMap = _instrumenter.lastSourceMap();
                    if (lastSourceMap) {
                        if (sourceMap) {
                            lastSourceMap = mergeSourceMap(
                                sourceMap,
                                lastSourceMap
                            )
                        }
                        instrumented += '\n' + convertSourceMap.fromObject(lastSourceMap).toComment();
                    }
                }
                fs.writeFileSync(
                    path.dirname(fullPath) + '/scratch-render.coverage.js',
                    instrumented
                );
                return instrumented;
            } catch (e) {
                console.error(e.stack || e.message || e.toString());
                process.exit(1);
            }
        }
        return buffer;
    }

    function loadFile (fullPath) {
        if (!fileCache[fullPath]) {
            fileCache[fullPath] = readFile(fullPath)
                .then(async buffer => ({
                    etag: createHash('md5')
                        .update(buffer)
                        .digest().base64Slice(),
                    buffer: await instrument(buffer, fullPath)
                }));
        }
    }

    const server = http.createServer(async function (req, res) {
        try {
            const fullPath = path.join(__dirname, '../..', req.url);
            try {
                await loadFile(fullPath);
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
        (async function () {
            const {port} = await server.ready;
            chromeless.goto(`http://localhost:${port}/${indexHTML}`);
        }());
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
        await chromeless.wait('.loaded');
        try {
            await chromeless.evaluate(function (name, coverage) {
                document.querySelector('.test-title').innerText = name;
                document.querySelector('.test-preview').innerHTML = '';
                if (!window.__coverage__) window.__coverage__ = coverage;
            }, name, global.__coverage__);
            const results = await func(t, chromeless);
            (results || []).map(([fn, ...args]) => {
                if (t[fn]) t[fn](...args);
            });
            global.__coverage__ = await chromeless.evaluate(function () {
                return window.__coverage__;
            });
        } catch (e) {
            t.fail(e.stack || e.message || String(e));
        }
        // await chromeless.goto(`about:blank`);
        t.end();
    });
};

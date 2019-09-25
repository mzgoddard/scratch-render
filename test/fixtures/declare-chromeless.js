const chromelessTest = require('./chromeless-tape');

function count (str, re) {
    let count = 0;
    for (let i = 0; i < str.length; i++) {
        if (re.test(str[i])) count++;
    }
    return count;
}

function indent (body) {
    const lines = body.split('\n');
    let braces = 0;
    let tab = '';
    let output = [];
    for (const line of lines) {
        let startIndex = line.split('').findIndex(c => /[^\s}\]]/.test(c));
        if (startIndex === -1) startIndex = line.length;

        const openBrace = count(line, /[{[]/);
        const startCloseBrace = count(line.substring(0, startIndex), /[}\]]/);
        const endCloseBrace = count(line.substring(startIndex), /[}\]]/);

        braces -= startCloseBrace;
        tab = Array.from({length: braces}, () => '    ').join('');
        output.push(line.replace(/^(\s*)/, tab));
        braces += openBrace - endCloseBrace;
    }
    return output.join('\n');
}

async function evaluate (t, chromeless, fn, ...args) {
    try {
        const results = await chromeless.evaluate(fn, ...args);
        (results || []).map(([fn, ...args]) => {
            if (t[fn]) t[fn](...args);
        });
    } catch (e) {
        t.fail(e.stack || e.message || e);
    }
}

const fnMap = new WeakMap();

const fs = require('fs');
try {
    fs.unlinkSync(process.mainModule.filename + '.test');
} catch (e) {}
fs.appendFileSync(process.mainModule.filename + '.test', [
    `const chromelessTest = require('../fixtures/chromeless-tape');`
].join('\n') + '\n\n');

const buildChromeless = function ({plan = 1, tests: _tests, ...state}, each, after) {
    const tests = _tests.map(([fn, ...args]) => {
        let testFn = fnMap.get(fn);
        if (!testFn) {
            const bakeFn = fn.toString()
                .replace(/^(async )?function\s?\(/, `\$1function ${fn.name} (`);
            fnMap.set(fn, new Function(indent(`
                return async function ${fn.name} (...args) {
                    try {
                        const context = window.context = window.context || {};
                        return await (${bakeFn})(context, ...args);
                    } catch (e) {
                        return [['fail', e.stack || e.message]];
                    }
                }
            `))());
            testFn = fnMap.get(fn);
        }
        return [testFn, ...args];
    });
    const fullTest = new Function(`
        return async function (coverage) {
            try {
                window.__coverage__ = coverage;
                const context = {};
                return [
                    ${tests.map(([fn, ...args], index) => `['comment', '${fn.name}(...${JSON.stringify(args)})'],\n...(await (${_tests[index][0].toString()})(context, ...${JSON.stringify(args)}) || [])`).join(',\n')}
                ].concat([['coverage', window.__coverage__]]);
            } catch (e) {
                return [['fail', e.stack || e.message]];
            }
        };
    `)();
    const fullArgs = tests.map(([fn, ...args]) => args);
    // console.log(fullTest.toString());
    // process.exit(1);
    const builtTest = async function (t, chromeless) {
        t.plan(plan);
        // for (const [fn, ...args] of tests) {
        //     t.comment(`evaluate ${fn.name}(...${JSON.stringify(args)})`);
        //     await evaluate(t, chromeless, fn, ...args);
        // }
        await evaluate(t, chromeless, fullTest, fullArgs);
    };
    Promise.resolve().then(() => {
        const file = /\/([^/]+)$/.exec(process.mainModule.filename)[1].split('.')[0];
        const body = indent(`chromelessTest('${file} tests: ${tests.length} asserts: ${plan}', async function (t, chromeless) {
            t.plan(${plan});
            try {
                const results = await chromeless.evaluate(${fullTest.toString()}, global.__coverage__);
                (results || []).map(([fn, ...args]) => {
                    if (fn === 'coverage') global.__coverage__ = args[0];
                    else if (t[fn]) t[fn](...args);
                });
            } catch (e) {
                t.fail(e.stack || e.message || e);
            }
        });`);
        fs.appendFileSync(process.mainModule.filename + '.test', body);
        eval(body);
    });
    return each({...state, builtTest, plan, tests: _tests}, after);
};

module.exports = {
    buildChromeless
};

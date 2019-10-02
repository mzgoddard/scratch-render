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

const writtenFilename = /^(.*)\.js$/.exec(process.mainModule.filename)[1] + '.test.js';
const registerFilename = /^(.*)\.js$/.exec(process.mainModule.filename)[1] + '.methods.js';
const registerUrl = '/' + require('path').relative(require('path').join(__dirname, '../..'), registerFilename);
const fs = require('fs');
try {
    fs.unlinkSync(writtenFilename);
    fs.unlinkSync(registerFilename);
} catch (e) {}
fs.appendFileSync(writtenFilename, [
    `const chromelessTest = require('../fixtures/chromeless-tape');`,
    '',
    // 'function register (fns) {',
    // '   return `function () {',
    // '       ${fns.map(fn => `(${fn.toString()})();\n`).join(\'\')}',
    // '   }`;',
    // '}',
    // '',
    'function load (methods) {',
    '    if (document.querySelector(\'.methods\')) return;',
    '    const script = document.createElement(\'script\');',
    '    return new Promise(resolve => {',
    '        script.onload = function () {',
    '            script.classList.add(\'methods\');',
    '            resolve();',
    '        };',
    '        script.src = methods;',
    '        document.body.appendChild(script);',
    '    });',
    '}',
    ''
].join('\n'));

let nextId = 1;

let fileUniqueNamedTests = [];
const testsSoFar = [];

function register (fns) {
    return `function () {
        ${fns.map(fn => `(${fn.toString()})();\n`).join('')}
    }`;
}

async function call (fn, context, args) {
    return [
        ['comment', `${fn.name}(...${JSON.stringify(args)})`],
        ...((await fn(context, ...args)) || []).map(test => (
            test[test.length - 1].stack || test[0] === 'comment' ?
                test :
                [...test, {
                    stack: new Error(test[test.length - 1]).stack
                        .split('\n').slice(4).join('\n')
                }]
        ))
    ];
}

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
    const testFns = [call, ..._tests.map(([fn]) => fn)];
    const uniqueTestFns = testFns.filter((fn, i) => (
        fn.name &&
        !testFns.some((_fn, _i) => (_i < i && _fn === fn))
    ));
    const newFileUniqueNamedTests = uniqueTestFns.filter((fn, i) => (
        fn.name &&
        !fileUniqueNamedTests.some((_fn, _i) => (_fn.name === fn.name))
    ));
    const uniqueNamedTests = newFileUniqueNamedTests.filter((fn, i) => (
        fn.name &&
        !newFileUniqueNamedTests.some((_fn, _i) => (_i < i && _fn.name === fn.name))
    ));
    fileUniqueNamedTests.push(...uniqueNamedTests);
    const usedUniqueTestFns = uniqueTestFns.filter(fn => fileUniqueNamedTests.some(_fn => _fn.toString() === fn.toString()));
    // const testUniqueNamedTests = uniqueNamedTests.filter(fn => !fileUniqueNamedTests.some(_fn => _fn.name === fn.name));
    // const uniqueNamedTests = [...fileUniqueNamedTests, ...testUniqueNamedTests];
    // console.log(`${uniqueNamedTests.map(([fn]) => [fn.name, fn.toString()]).join('\n')}`);
    // ${testUniqueNamedTests.map(fn => fn.toString().replace(/^(async )?function\s?\(/, `\$1function ${fn.name} (`)).join('\n')}

    const index = nextId++;
    const fullTest = new Function(`
        return async function test_${index} () {
            const context = {};
            return [
                ${tests.map(([fn, ...args], index) => `...(await call(${fileUniqueNamedTests.some(fn => fn.toString() === _tests[index][0].toString()) ? _tests[index][0].name : _tests[index][0].toString()}, context, ${JSON.stringify(args)}))`).join(',\n')}
            ];
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

    // fs.appendFileSync(writtenFilename, uniqueNamedTests.map(fn => indent(`\nfunction register_${fn.name} () {\nif (window.${fn.name}) return;\nwindow.${fn.name} = ${fn.toString()};\n}`)).join(''));
    fs.appendFileSync(registerFilename, uniqueNamedTests.map(fn => indent(`${fn.toString()}\n`)).join(''));

    const file = /\/([^/]+)$/.exec(process.mainModule.filename)[1].split('.')[0];
    const debugName = `${file} tests: ${tests.length} asserts: ${plan}`;
    const name = `${index}: ${state.name || debugName}`;
    const body = indent(`async function (t, chromeless) {
        t.plan(${plan});
        await chromeless.evaluate(load, '${registerUrl}');
        return await chromeless.evaluate(function () {
            try {
                return test_${index}();
            } catch (e) {
                return [['fail', e.message || 'threw error', {stack: e.stack}]];
            }
        });
    }`);
    const testBody = `chromelessTest('${name}', ${body});\n`;
    if (testsSoFar.includes(body)) {
        throw new Error('Duplicate test produced');
    }

    Promise.resolve().then(() => {
        fs.appendFileSync(writtenFilename, '\n' + testBody);
        fs.appendFileSync(registerFilename, indent(`// ${name}\n${fullTest.toString()}\n`));
        return;
        eval(
            register.toString() +
            usedUniqueTestFns
                .map(fn => `\nfunction register_${fn.name} () {\nif (window.${fn.name}) return;\nwindow.${fn.name} = ${fn.toString()};\n}`).join('') +
            testBody
        );
    });
    return each({...state, builtTest, plan, tests: _tests}, after);
};

module.exports = {
    buildChromeless
};

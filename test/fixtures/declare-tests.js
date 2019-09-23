const merge = function (s, t) {
    return {
        ...s,
        plan: (s.plan || 0) + (t.plan || 0),
        module: {...s.module, ...t.module},
        tests: [...s.tests, ...t.tests]
    };
};

const _or = function (a, b) {
    if (typeof a !== 'function') throw new Error('Passed a non-function.');
    if (typeof b !== 'function') throw new Error('Passed a non-function.');
    return function _orScope (state, each, after) {
        return a(state, each, function _orAfter_a () {
            return b(state, each, after);
        });
    };
};

const or = function (list) {
    return list.reduceRight((carry, item) => {
        return _or(item, carry);
    });
};

const _and = function (a, b) {
    if (typeof a !== 'function') throw new Error('Passed a non-function.');
    if (typeof b !== 'function') throw new Error('Passed a non-function.');
    return function _andScope (state, each, after) {
        return a(state, function _andEach_a (state, after) {
            return b(state, each, after);
        }, after);
    };
};

const and = function (list) {
    return list.reduceRight((carry, item) => {
        return _and(item, carry);
    });
};

const add = function ({test, tests, ..._state}) {
    tests = tests ? tests : test ? [test] : [];
    return function _addScope (state, each, after) {
        return each(merge(state, {..._state, tests}), after);
    };
};

const state = function (key, valueTest = value => value === true) {
    return function _stateScope (state, each, after) {
        if (valueTest(state[key])) {
            return each(state, after);
        }
        return after;
    };
};

const get = function (key, valueTest) {
    return function _getScope (state, each, after) {
        const test = (new Function (`
            return function (context) {
                return [
                    ['ok', ${JSON.stringify(key)} in context.value],
                    ${valueTest ? `(${valueTest.toString()})(context)` : ''}
                ];
            };
        `)());
        return each(merge(state, {plan: valueTest ? 2 : 1, tests: [test]}), after);
    };
};

const resolver = function (map) {
    return function (name, state) {
        return map[name];
    };
};

const callDefault = function (state, each, after) { return after; };
const call = function (name, _default = callDefault) {
    return function _callScope (state, each, after) {
        return (state.resolver(name, state) || _default)(state, each, after);
    };
};

const loadModuleVar = function (name, srcPath) {
    return function _loadModuleVarScope (state, each, after) {
        if (state.module && state.module[name]) return each(state, after);
        const test = new Function(`return function (context) {
            context.module = context.module || {};
            context.module.${name} = window['scratch-render'](${JSON.stringify(srcPath)});
            return [['ok', context.module.${name}]];
        }`)();
        return each(merge(state, {
            plan: 1,
            module: {[name]: true},
            tests: [test]
        }), after);
    };
};

const loadModule = loadModuleVar;

const run = function (f) {
    let last = f;
    while (f) {
        // console.log(f.toString());
        last = f;
        const _f = f();
        if (_f && typeof _f !== 'function') {
            throw new Error('Returned non-function.\n' + String(_f));
        }
        f = _f;
    }
    // console.log(last.toString());
};

const fail = function (state, each, after) {
    return after;
};

const pass = function (state, each, after) {
    return each(state, after);
};

const build = function (state, each, after) {
    const builtTest = new Function (`
        return async function () {
            const context = {};
            ${state.tests.map(test => `(await (${test.toString()}(context))).map();`).join('\n')}
        };
    `)();
    return each({...state, builtTest}, after);
};

module.exports = {
    or,
    and,
    add,
    state,
    get,
    resolver,
    call,
    loadModuleVar,
    loadModule,
    run,
    fail,
    pass,
    build
};

const merge = function (s, t) {
    return {
        ...s,
        ...t,
        name: (s.name || '') + (s.name && t.name ? ', ' : '') + (t.name || ''),
        plan: (s.plan || 0) + (t.plan || 0),
        module: {...s.module, ...t.module},
        tests: [...(s.tests || []), ...(t.tests || [])]
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

const _and = function (a, b) {
    if (typeof a !== 'function') throw new Error('Passed a non-function.');
    if (typeof b !== 'function') throw new Error('Passed a non-function.');
    return function _andScope (state, each, after) {
        return a(state, function _andEach_a (state, after) {
            return b(state, each, after);
        }, after);
    };
};

const _reduceRight = function (fn) {
    return function (list) {
        return list.reduceRight((carry, item) => fn(item, carry));
    };
};

const or = _reduceRight(_or);
const and = _reduceRight(_and);

const not = function (f) {
    return function (state, each, after) {
        return f(state, function _notEach (state) {
            return fail(state, each, after);
        }, function _notAfter () {
            return each(state, after);
        });
    };
};

const optional = function (f, then) {
    return or([
        not(f),
        and([f, then])
    ]);
};

const add = function (addState) {
    return function _addScope (state, each, after) {
        let {test, tests, ..._state} = typeof addState === 'function' ? addState(state) : addState;
        tests = tests ? tests : test ? [test] : [];
        return each(merge(state, {..._state, tests}), after);
    };
};

const state = function (path, valueTest = value => value === true) {
    return function _stateScope (state, each, after) {
        let value = state;
        if (typeof path === 'string') value = value[path];
        else {
            for (let i = 0; value && i < path.length; i++) {
                value = value[path[i]];
            }
        }

        if (valueTest(value)) return each(state, after);
        if (state.reports) {
            state.reports.push({
                reason: 'state',
                args: [path, valueTest],
                value,
                tests: state.tests || []
            });
        }
        return after;
    };
};

function hasProperty (context, key) {
    return [['ok', key in context.value, `has ${key} property`]];
};

const get = function (key) {
    return add({
        plan: 1,
        test: [hasProperty, key]
    });
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

function loadModuleVarTest (context, name, srcPath) {
    context.module = context.module || {};
    context.module[name] = window['scratch-render'](srcPath);
    return [['ok', context.module[name], `module ${name} loaded`]];
};

const loadModuleVar = function (name, srcPath) {
    return or([
        state(['module', name]),
        and([
            not(state(['module', name])),
            add({
                plan: 1,
                module: {[name]: true},
                tests: [[loadModuleVarTest, name, srcPath]]
            })
        ])
    ]);
};

const loadModule = loadModuleVar;

const afterEach = function (state, after) {
    return after;
};

const run = function (f, state = {}, each = afterEach, after = buildPlan.end) {
    if (f) f = f(state, each, after);
    while (f) {
        const _f = f();
        if (_f && typeof _f !== 'function') {
            throw new Error('Returned non-function.\n' + String(_f));
        }
        f = _f;
    }
};

const fail = function (state, each, after) {
    if (state.reports) {
        state.reports.push({
            reason: 'fail',
            tests: state.tests || []
        });
    }
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

let plan;
let count;
let reports;
const buildPlan = function (_plan) {
    plan = _plan;
    count = 0;
    return function (state, each, after) {
        reports = state.reports;
        if (state.reports) {
            state.reports.push({
                reason: 'true',
                tests: state.tests
            });
        }

        count++;
        return each(state, after);
    };
};

buildPlan.end = function () {
    if (plan !== count) {
        if (reports) {
            console.error(JSON.stringify(reports, function (key, value) {
                if (typeof value === 'function') {
                    return value.toString();
                }
                return value;
            }, '    '));
        }
        throw new Error(`Planned to build ${plan} tests, but built ${count}.`);
    }
};

module.exports = {
    or,
    and,
    optional,
    add,
    state,
    get,
    resolver,
    call,
    afterEach,
    loadModuleVar,
    loadModule,
    run,
    fail,
    pass,
    build,
    buildPlan,
    merge,
    not
};

const chromelessTest = require('../fixtures/chromeless-tape');

function register_call () {
    if (window.call) return;
    window.call = async function call (fn, context, args) {
        return [
            ['comment', `${fn.name}(...${JSON.stringify(args)})`],
            ...((await fn(context, ...args)) || [])
        ];
    };
}
function register_loadModuleVarTest () {
    if (window.loadModuleVarTest) return;
    window.loadModuleVarTest = function loadModuleVarTest (context, name, srcPath) {
        context.module = context.module || {};
        context.module[name] = window['scratch-render'](srcPath);
        return [['ok', context.module[name]]];
    };
}
function register_skinIdTest () {
    if (window.skinIdTest) return;
    window.skinIdTest = function skinIdTest (context) {
        context.skinId = Math.random().toString().slice(2);
    };
}
function register_newSkinTest () {
    if (window.newSkinTest) return;
    window.newSkinTest = function newSkinTest (context) {
        context.value = context.skin = new context.module.Skin(context.skinId);
    };
}
function register_getTest () {
    if (window.getTest) return;
    window.getTest = function getTest (context, key) {
        return [['ok', key in context.value]];
    };
}
function register_rotationCenterIsArray () {
    if (window.rotationCenterIsArray) return;
    window.rotationCenterIsArray = function rotationCenterIsArray (context) {
        return [['ok', context.value.rotationCenter.length >= 2]];
    };
}
chromelessTest('1: Skin tests: 8 asserts: 6', async function (t, chromeless) {
    t.plan(6);
    
    for (const fn of [register_call, register_loadModuleVarTest, register_skinIdTest, register_newSkinTest, register_getTest, register_rotationCenterIsArray]) {
        await chromeless.evaluate(fn);
    }
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["Skin","./Skin.js"])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(newSkinTest, context, [])),
                ...(await call(getTest, context, ["on"])),
                ...(await call(getTest, context, ["off"])),
                ...(await call(getTest, context, ["id"])),
                ...(await call(getTest, context, ["rotationCenter"])),
                ...(await call(rotationCenterIsArray, context, []))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
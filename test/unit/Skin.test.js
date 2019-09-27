const chromelessTest = require('../fixtures/chromeless-tape');

function register (fns) {
   return `function () {
       ${fns.map(fn => `(${fn.toString()})();
`).join('')}
   }`;
}

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
        context.module[name] = window.ScratchRenderFiles(srcPath);
        return [['ok', context.module[name], `module ${name} loaded`]];
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
function register_hasPropertyTest () {
    if (window.hasPropertyTest) return;
    window.hasPropertyTest = function hasPropertyTest (context, key) {
        // Test that this does not throw.
        context.value[key];
        return [['ok', key in context.value, `has ${key} property`]];
    };
}
function register_rotationCenterIsArray () {
    if (window.rotationCenterIsArray) return;
    window.rotationCenterIsArray = function rotationCenterIsArray (context) {
        return [['ok', context.value.rotationCenter.length >= 2, 'rotationCenter is an array']];
    };
}
function register_dispose () {
    if (window.dispose) return;
    window.dispose = function dispose (context) {
        context.skin.dispose();
        return [['equal',
                context.skin.id,
                context.module.RenderConstants.ID_NONE,
                'disposed of its id'
        ]];
    };
}
chromelessTest('1: new Skin', async function (t, chromeless) {
    t.plan(8);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_skinIdTest, register_newSkinTest, register_hasPropertyTest, register_rotationCenterIsArray]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["Skin","./Skin.js"])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(newSkinTest, context, [])),
                ...(await call(hasPropertyTest, context, ["on"])),
                ...(await call(hasPropertyTest, context, ["off"])),
                ...(await call(hasPropertyTest, context, ["id"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(hasPropertyTest, context, ["isRaster"])),
                ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
                ...(await call(rotationCenterIsArray, context, []))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
chromelessTest('2: new Skin, dispose', async function (t, chromeless) {
    t.plan(10);
    
    await chromeless.evaluate(register([register_call, register_loadModuleVarTest, register_skinIdTest, register_newSkinTest, register_hasPropertyTest, register_rotationCenterIsArray, register_dispose]));
    
    return await chromeless.evaluate(async function (coverage) {
        try {
            const context = {};
            return [
                ...(await call(loadModuleVarTest, context, ["Skin","./Skin.js"])),
                ...(await call(skinIdTest, context, [])),
                ...(await call(newSkinTest, context, [])),
                ...(await call(hasPropertyTest, context, ["on"])),
                ...(await call(hasPropertyTest, context, ["off"])),
                ...(await call(hasPropertyTest, context, ["id"])),
                ...(await call(hasPropertyTest, context, ["rotationCenter"])),
                ...(await call(hasPropertyTest, context, ["isRaster"])),
                ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
                ...(await call(rotationCenterIsArray, context, [])),
                ...(await call(loadModuleVarTest, context, ["RenderConstants","./RenderConstants.js"])),
                ...(await call(dispose, context, []))
            ];
        } catch (e) {
            return [['fail', e.stack || e.message]];
        }
    });
});
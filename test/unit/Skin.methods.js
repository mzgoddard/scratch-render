async function call (fn, context, args) {
    return [
        ['comment', `${fn.name}(...${JSON.stringify(args)})`],
        ...((await fn(context, ...args)) || []).map(test => test[test.length - 1].stack ? test : [...test, {stack: new Error(test[test.length - 1]).stack.split('\n').slice(4).join('\n')}])
    ];
}
function loadModuleVarTest (context, name, srcPath) {
    context.module = context.module || {};
    context.module[name] = window.ScratchRenderFiles(srcPath);
    return [['ok', context.module[name], `module ${name} loaded`]];
}
function skinIdTest (context) {
    context.skinId = Math.random().toString().slice(2);
}
function newSkinTest (context) {
    context.value = context.skin = new context.module.Skin(context.skinId);
}
function valueTest (context, key) {
    context.value = context[key];
    return [['ok', typeof context.value !== 'undefined', 'context.value is set']];
}
function hasPropertyTest (context, key) {
    // Test that this does not throw.
    context.value[key];
    return [['ok', key in context.value, `has ${key} property`]];
}
function rotationCenterIsArray (context) {
    return [['ok', context.value.rotationCenter.length >= 2, 'rotationCenter is an array']];
}
function dispose (context) {
    context.skin.dispose();
    return [['equal',
            context.skin.id,
            context.module.RenderConstants.ID_NONE,
            'disposed of its id'
    ]];
}
// 1: new Skin
async function test_1 () {
    const context = {};
    return [
        ...(await call(loadModuleVarTest, context, ["Skin","./Skin.js"])),
        ...(await call(skinIdTest, context, [])),
        ...(await call(newSkinTest, context, [])),
        ...(await call(valueTest, context, ["skin"])),
        ...(await call(hasPropertyTest, context, ["on"])),
        ...(await call(hasPropertyTest, context, ["off"])),
        ...(await call(valueTest, context, ["skin"])),
        ...(await call(hasPropertyTest, context, ["id"])),
        ...(await call(hasPropertyTest, context, ["rotationCenter"])),
        ...(await call(hasPropertyTest, context, ["isRaster"])),
        ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
        ...(await call(rotationCenterIsArray, context, []))
    ];
}
// 2: new Skin, dispose
async function test_2 () {
    const context = {};
    return [
        ...(await call(loadModuleVarTest, context, ["Skin","./Skin.js"])),
        ...(await call(skinIdTest, context, [])),
        ...(await call(newSkinTest, context, [])),
        ...(await call(valueTest, context, ["skin"])),
        ...(await call(hasPropertyTest, context, ["on"])),
        ...(await call(hasPropertyTest, context, ["off"])),
        ...(await call(valueTest, context, ["skin"])),
        ...(await call(hasPropertyTest, context, ["id"])),
        ...(await call(hasPropertyTest, context, ["rotationCenter"])),
        ...(await call(hasPropertyTest, context, ["isRaster"])),
        ...(await call(hasPropertyTest, context, ["hasPremultipliedAlpha"])),
        ...(await call(rotationCenterIsArray, context, [])),
        ...(await call(loadModuleVarTest, context, ["RenderConstants","./RenderConstants.js"])),
        ...(await call(dispose, context, []))
    ];
}

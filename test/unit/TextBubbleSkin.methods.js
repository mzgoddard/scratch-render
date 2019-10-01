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
function createCanvas (context) {
    context.canvas = document.createElement('canvas');
    context.canvas.width = 480;
    context.canvas.height = 360;
}
function newRenderWebGL (context) {
    context.renderer = new context.module.RenderWebGL(context.canvas);
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
function skinIdTest (context) {
    context.skinId = Math.random().toString().slice(2);
}
function newTextBubbleSkin (context) {
    context.value = context.skin = new context.module.TextBubbleSkin(context.skinId, context.renderer);
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
function willEmitEventTest (context, event) {
    context.event = context.event || {};
    context.event[event] = {
        called: false,
        calledPromise: null,
        call: []
    };
    context.event[event].calledPromise = new Promise(function (resolve) {
        context.value.on(event, function (...args) {
            context.event[event].called = true;
            context.event[event].call.push(args);
            resolve(context.event[event]);
        });
    });
}
function createTextBubble (context, textBubble) {
    context.textBubble = textBubble;
    context.imageSize = textBubble.size;
    context.imageRotationCenter = [0, 0];
}
function setTextBubble (context) {
    const {type, text, pointsLeft} = context.textBubble;
    context.skin.setTextBubble(type, text, pointsLeft);
}
function skinSize (context) {
    const {size} = context.skin;
    return [['same',
            [Math.ceil(size[0]), Math.ceil(size[1])],
            context.imageSize,
            'skin.size matches image size'
    ]];
}
async function didEmitEventTest (context, event) {
    return [
        await Promise.race([
            context.event[event].calledPromise
            .then(({called}) => (['ok', called, `did emit ${event}`])),
            new Promise((resolve) => setTimeout(resolve, 100))
            .then(() => (['fail', 'timeout']))
        ])
    ];
}
function skinRotationCenter (context) {
    const {rotationCenter} = context.skin;
    return [['same',
            [Math.ceil(rotationCenter[0]), Math.ceil(rotationCenter[1])],
            context.imageRotationCenter,
            'skin.rotationCenter matches'
    ]];
}
function texture (context, scale) {
    const tex = context.skin.getTexture(scale);
    const uniforms = context.skin.getUniforms(scale);
    return [
        ['ok', tex !== null && typeof tex === 'object', 'returns texture'],
        ['ok', uniforms.u_skin === tex, 'u_skin is texture'],
        ['same', Array.from(uniforms.u_skinSize, Math.ceil), context.imageSize, 'u_skinSize is size']
    ];
}

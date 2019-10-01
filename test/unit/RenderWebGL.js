const {optional, state, evaluate, not, resolver, some, every, call, run, build, loadModule, buildPlan, afterEach, value} = require('../fixtures/declare-tests');
const {buildChromeless} = require('../fixtures/declare-chromeless');

const declareAssets = require('../fixtures/declare-assets');
const declareRenderWebGL = require('../fixtures/declare-RenderWebGL');
const declareSkin = require('../fixtures/declare-Skin');

run(every([
    some([
        call('renderer'),
        every([
            evaluate({everyImageLoader: true}),
            call('rendererCreateSkin'),
        ]),
        call('rendererUpdateSkin'),
        call('rendererUpdateDrawableSkin'),
        call('rendererDrawableTouching'),
        call('rendererPick'),
        call('rendererIsTouchingDrawables'),
        call('rendererIsTouchingColor'),
        call('rendererDraw')
    ]),
    buildChromeless,
    buildPlan(172)
]), {
    reports: [],
    resolver: resolver({
        ...declareSkin,
        ...declareAssets,
        ...declareRenderWebGL
    }),
});

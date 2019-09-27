const {optional, state, evaluate, not, resolver, some, every, call, run, build, loadModule, buildPlan, afterEach, value} = require('../fixtures/declare-tests');
const {buildChromeless} = require('../fixtures/declare-chromeless');

const declareAssets = require('../fixtures/declare-assets');
const declareRenderWebGL = require('../fixtures/declare-RenderWebGL');
const declareSkin = require('../fixtures/declare-Skin');

run(every([
    some([
        every([
            evaluate({
                everyImageLoader: true
            }),
            call('rendererCreateSkin'),
        ]),
        every([
            call('rendererUpdateSkin')
        ])
    ]),
    buildChromeless,
    // buildPlan(81)
]), {
    reports: [],
    resolver: resolver({
        ...declareSkin,
        ...declareAssets,
        ...declareRenderWebGL
    }),
});

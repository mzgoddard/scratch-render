const {optional, state, add, not, resolver, or, and, call, run, build, loadModule, buildPlan, afterEach} = require('../fixtures/declare-tests');
const {buildChromeless} = require('../fixtures/declare-chromeless');

const {loadSVG} = require('../fixtures/declare-assets');
const declareRenderWebGL = require('../fixtures/declare-RenderWebGL');
const declareSkin = require('../fixtures/declare-Skin');

const newSVGSkin = and([
    call('renderer'),
    call('skinId'),
    loadModule('SVGSkin', './SVGSkin.js'),
    add({
        concreteSkin: true,
        name: 'new SVGSkin',
        test: [function newSVGSkin (context) {
            context.value = context.skin = new context.module.SVGSkin(context.skinId, context.renderer);
        }]
    })
]);

const newSkin = newSVGSkin;

const createSVG = or([
    loadSVG('orange50x50.svg', [50, 50]),
    loadSVG('purple100x100.svg', [100, 100]),
    loadSVG('gradient50x50.svg', [50, 50]),
    loadSVG('gradient100x100.svg', [100, 100])
]);

const createImage = createSVG;

const setSVG = and([
    optional(state('imageRotationCenter'),
        add({
            oldImageRotationCenter: true,
            test: [function setOldImageRotationCenter (context) {
                context.oldImageRotationCenter = context.imageRotationCenter;
            }]
        })
    ),
    or([
        add(state => ({
            imageRotationCenter: true,
            name: `setSVG(${state.imageName})`,
            test: [function setSVG (context) {
                context.imageRotationCenter = context.imageSize.map(dim => dim / 2);
                context.skin.setSVG(context.imageSource);
            }]
        })),
        add(state => ({
            imageRotationCenter: true,
            name: `setSVG(${state.imageName}, [10, 10])`,
            test: [function setSVG_rotationCenter (context) {
                context.imageRotationCenter = [10, 10];
                context.skin.setSVG(context.imageSource, [10, 10]);
            }]
        }))
    ])
]);

const setImage = setSVG;

run(and([
    or([
        call('skinDispose'),
        call('skinUpdate')
    ]),
    buildChromeless,
    buildPlan(81)
]), {
    reports: [],
    resolver: resolver({
        ...declareRenderWebGL,
        ...declareSkin,
        createImage,
        setImage,
        newSkin,
    }),
});

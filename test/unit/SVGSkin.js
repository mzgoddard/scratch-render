const {optional, state, add, not, resolver, or, and, call, run, build, loadModule, buildPlan, afterEach} = require('../fixtures/declare-tests');
const {buildChromeless} = require('../fixtures/declare-chromeless');

const declareSkin = require('../fixtures/declare-Skin');

const canvas = add({
    test: [function createCanvas (context) {
        context.canvas = document.createElement('canvas');
    }]
});

const renderer = and([
    loadModule('RenderWebGL', './RenderWebGL.js'),
    canvas,
    add({
        test: [function newRenderWebGL (context) {
            context.renderer = new context.module.RenderWebGL(context.canvas);
        }]
    })
]);

const newSVGSkin = and([
    renderer,
    call('skinId'),
    loadModule('SVGSkin', './SVGSkin.js'),
    add({
        concreteSkin: true,
        name: 'new SVGSkin',
        test: [function newSVGSkin (context) {
            context.value = context.skin = new context.module.SVGSkin(context.skinId, context.renderer);
        }]
    })
])

const newSkin = newSVGSkin;

const loadSVG = function (name, size) {
    return add({
        plan: 1,
        imageSize: true,
        imageName: name,
        test: [async function loadSVG_fetch (context, name, size) {
            context.imageSize = size;
            context.imageSource = await fetch(`./assets/${name}`)
                .then(response => response.text());
            return [
                ['comment', `fetch('./assets/${name}')`],
                ['ok', typeof context.imageSource === 'string']
            ];
        }, name, size]
    });
};

const createSVG = or([
    loadSVG('orange50x50.svg', [50, 50]),
    loadSVG('purple100x100.svg', [100, 100]),
    loadSVG('gradient50x50.svg', [50, 50]),
    loadSVG('gradient100x100.svg', [100, 100])
]);

const createImage = createSVG;

const setSVG = and([
    optional(
        state('imageRotationCenter'),
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
    call('skinUpdate'),
    buildChromeless,
    buildPlan(72)
]), {
    reports: [],
    resolver: resolver({
        ...declareSkin,
        createImage,
        setImage,
        newSkin,
    }),
});

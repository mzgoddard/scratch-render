const {evaluate, loadModule, every} = require('./declare-tests');

const canvas = evaluate({
    test: [function createCanvas (context) {
        context.canvas = document.createElement('canvas');
    }]
});

const renderer = every([
    loadModule('RenderWebGL', './RenderWebGL.js'),
    canvas,
    evaluate({
        test: [function newRenderWebGL (context) {
            context.renderer = new context.module.RenderWebGL(context.canvas);
        }]
    })
]);

module.exports = {
    canvas,
    renderer
};

const {add, loadModule, and} = require('./declare-tests');

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

module.exports = {
    canvas,
    renderer
};

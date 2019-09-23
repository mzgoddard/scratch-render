const test = require('tap');

const {add, resolver, and, call, run, build, loadModule} = require('../fixtures/declare-tests');
const {buildChromeless} = require('../fixtures/declare-chromeless');

const declareSkin = require('../fixtures/declare-Skin');

const newSkin = and([
    loadModule('Skin', './Skin.js'),
    call('skinId'),
    add({
        concreteSkin: false,
        test: function (context) {
            context.value = context.skin = new context.module.Skin(context.skinId);
        }
    })
]);

run(and([call('skinUpdate'), buildChromeless])({
    resolver: resolver({
        ...declareSkin,
        newSkin,
    }),
    tests: []
}, function (state, after) {
    // console.log(state.builtTest.toString());
    return after;
}));

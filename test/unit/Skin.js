const test = require('tap');

const chromelessTape = require('../fixtures/chromeless-tape');

const build = function (bit) {
    bit();
};

const bit = function (wrapper) {
    return function (...args) {
        return Object.assign(function () {
            // return wrapper(...args.map(arg => arg.wrapper ? arg() : arg));
        }, {wrapper, args});
    };
};

const or = bit(function (list) {
    return function (...args) {
        for (const item of list) {
            item(...args);
        }
    };
});

const and = bit(function (list) {
    return function (...args) {
        list.reduce(function (carry, item) {
            return carry()
        }, args[0]);
    };
});

const newSkin = or([
    and([
        function ({context}) {
            context.value = context.skin = new Skin(context.skinId);
        },
    ]),
    and([
        function ({context}) {
            context.value = context.skin = new SVGSkin(context.skinId, context.renderer);
        }
    ], [renderer])
], [skinId])

const createImage = or([
    
])

const changeSkin = and([
    createImage(),
    setImage()
])

const skin = or([
    and([]),
    and([
        willEmitEvent('WasAltered'),
        changeSkin(),
        didEmitEvent('WasAltered')
    ])
], [newSkin])

const skinEventWasAltered = or([
    and([]),
    and([
        willEmitEvent('WasAltered')
        changeSkin()
        didEmitEvent('WasAltered')
    ])
], [skin])

hasEventsMembers([newSkin])

hasMembers({
    isRaster
    id
    rotationCenter
}, [newSkin])

and([
    willEmitEvent('WasAltered')
    changeSkin()
    ifConcrete(ifLoaded(hasMembers({
      size
    })))
    ifConcrete(ifLoaded(hasMembers({
      rotationCenter
    })))
    didEmitEvent('WasAltered')
], [skin])

hasMembers({
    size
    rotationCenter
}, [skinEventWasAltered])

ifConcrete(ifLoaded(hasMembers({
  rotationCenter
})), [skinEventWasAltered])

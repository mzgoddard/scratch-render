const {not, state, fail, every, hasProperty, evaluate, call, some, pass, value, loadModule} = require('./declare-tests');
const {willEmitEvent, didEmitEvent, eventsMembers} = require('./declare-events');

const concrete = state('concreteSkin');
const createImage = fail;
const didEmitWasAltered = didEmitEvent('WasAltered');
// const didEmitWasAltered = pass;
// const eventsMembers = every([
//     hasProperty('on'),
//     hasProperty('off')
// ]);
const newSkin = call('newSkin');
const setImage = fail;
const skinId = evaluate({
    test: [function skinIdTest (context) {
        context.skinId = Math.random().toString().slice(2);
    }]
});
const skinInitialMembers = every([
    value('skin'),
    hasProperty('id'),
    hasProperty('rotationCenter'),
    hasProperty('isRaster'),
    hasProperty('hasPremultipliedAlpha'),
    evaluate({
        plan: 1,
        test: [function rotationCenterIsArray (context) {
            return [['ok', context.value.rotationCenter.length >= 2, 'rotationCenter is an array']];
        }]
    })
]);
const willEmitWasAltered = willEmitEvent('WasAltered');
// const willEmitWasAltered = pass;

const postChangeSkin = every([
    value('skin'),
    hasProperty('size'),
    state('imageSize'),
    evaluate({
        plan: 1,
        test: [function skinSize (context) {
            const {size} = context.skin;
            return [['same',
                [Math.ceil(size[0]), Math.ceil(size[1])],
                context.imageSize,
                'skin.size matches image size'
            ]];
        }]
    }),
    hasProperty('rotationCenter'),
    some([
        not(state('oldImageRotationCenter')),
        every([
            state('oldImageRotationCenter'),
            evaluate({
                plan: 1,
                test: [function oldSkinRotationCenter (context) {
                    const {rotationCenter} = context.skin;
                    return [['same',
                        [Math.ceil(rotationCenter[0]), Math.ceil(rotationCenter[1])],
                        context.oldImageRotationCenter,
                        'rotationCenter has not updated yet'
                    ]];
                }]
            })
        ])
    ])
]);

function skinRotationCenter (context) {
    const {rotationCenter} = context.skin;
    return [['same',
        [Math.ceil(rotationCenter[0]), Math.ceil(rotationCenter[1])],
        context.imageRotationCenter,
        'skin.rotationCenter matches'
    ]];
}

const postAlterSkin = every([
    value('skin'),
    hasProperty('size'),
    hasProperty('rotationCenter'),
    state('imageRotationCenter'),
    evaluate({
        plan: 1,
        test: [skinRotationCenter]
    })
]);

function texture (context, scale) {
    const tex = context.skin.getTexture(scale);
    const uniforms = context.skin.getUniforms(scale);
    return [
        ['ok', tex !== null && typeof tex === 'object', 'returns texture'],
        ['ok', uniforms.u_skin === tex, 'u_skin is texture'],
        ['same', Array.from(uniforms.u_skinSize, Math.ceil), context.imageSize, 'u_skinSize is size']
    ];
}

const getTexture = evaluate(state => ({
    plan: 3,
    name: `getTexture(${state.scale ? JSON.stringify(state.scale) : ''})`,
    test: [texture, state.scale],
}));

const changeSkin = every([
    call('concrete'),
    call('willEmitWasAltered'),
    call('createImage'),
    call('setImage'),
    call('postChangeSkin'),
    call('didEmitWasAltered'),
    call('postAlterSkin'),
    call('getTexture')
])

const skin = some([
    every([
        newSkin,
        value('skin'),
        call('eventsMembers'),
        call('skinInitialMembers')
    ]),
    every([
        newSkin,
        changeSkin,
    ])
])

function dispose (context) {
    context.skin.dispose();
    return [['equal',
        context.skin.id,
        context.module.RenderConstants.ID_NONE,
        'disposed of its id'
    ]];
}

const skinDispose = every([
    call('skin'),
    loadModule('RenderConstants', './RenderConstants.js'),
    evaluate({
        plan: 1,
        name: 'dispose',
        test: [dispose]
    })
]);

const skinUpdate = every([
    call('skin'),
    changeSkin
])

module.exports = {
    changeSkin,
    concrete,
    createImage,
    didEmitWasAltered,
    eventsMembers,
    newSkin,
    postAlterSkin,
    postChangeSkin,
    setImage,
    skinDispose,
    skin,
    skinId,
    skinInitialMembers,
    skinUpdate,
    willEmitWasAltered,
    getTexture
};

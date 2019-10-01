const {value, pass, call, state, evaluate, loadModule, every, some, init, not, hasProperty} = require('./declare-tests');

const canvas = evaluate({
    test: [function createCanvas (context) {
        context.canvas = document.createElement('canvas');
        context.canvas.width = 480;
        context.canvas.height = 360;
    }]
});

const renderer = init(state('renderer'), every([
    loadModule('RenderWebGL', './RenderWebGL.js'),
    canvas,
    evaluate({
        renderer: true,
        test: [function newRenderWebGL (context) {
            context.renderer = new context.module.RenderWebGL(context.canvas);
        }]
    }),
    value('renderer'),
    hasProperty('gl'),
    hasProperty('canvas')
]));

const setSkinContext = evaluate({
    test: [function setSkinContext (context) {
        context.skin = context.renderer._allSkins[context.skinId];
    }]
});

const rendererSVGMethod = function (...test) {
    return every([
        state('svgImage'),
        evaluate(state => ({
            name: `${test[0].name}(${state.imageName})`,
            test
        })),
        setSkinContext,
        value('skin'),
        call('willEmitWasAltered'),
        call('didEmitWasAltered')
    ]);
};

const rendererBitmapMethod = function (...test) {
    return every([
        state('bitmapImage'),
        evaluate(state => ({
            name: `${test[0].name}(${state.imageName})`,
            test
        })),
        setSkinContext
    ]);
};

const rendererTextBubbleMethod = function (...test) {
    return every([
        state('textBubble'),
        evaluate(({textBubble: {type, text, pointsLeft}}) => ({
            name: `${test[0].name}(${type}, ${text}, ${pointsLeft})`,
            test
        })),
        setSkinContext
    ]);
};

const rendererNewSkin = every([
    call('createImage'),
    some([
        rendererSVGMethod(function createSVGSkin (context) {
            context.skinId = context.renderer.createSVGSkin(context.imageSource);
        }),
        rendererBitmapMethod(function createBitmapSkin (context) {
            context.skinId = context.renderer.createBitmapSkin(context.imageSource);
        }),
        rendererTextBubbleMethod(function createTextBubbleSkin (context) {
            const {type, text, pointsLeft} = context.textBubble;
            context.skinId = context.renderer.createTextSkin(type, text, pointsLeft);
        })
    ])
]);

const rendererNewPenSkin = every([
    evaluate({
        imageSize: true,
        imageRotationCenter: true,
        test: [function (context) {
            context.imageSize = [480, 360];
            context.imageRotationCenter = [240, 180];
        }]
    }),
    evaluate({
        penSkin: true,
        test: [function createPenSkin (context) {
            context.skinId = context.renderer.createPenSkin();
        }]
    }),
    setSkinContext
]);

const rendererSetLayerStageSprite = init(state('setLayerGroupOrdering'), evaluate({
    setLayerGroupOrdering: true,
    test: [function rendererSetLayerGroupOrdering (context) {
        context.renderer.setLayerGroupOrdering(['stage', 'sprite']);
    }]
}));

const rendererSetLayerStagePenSprite = init(state('setLayerGroupOrdering'), evaluate({
    setLayerGroupOrdering: true,
    test: [function rendererSetLayerGroupOrdering (context) {
        context.renderer.setLayerGroupOrdering(['stage', 'pen', 'sprite']);
    }]
}));

const rendererNewDrawable = evaluate({
    plan: 3,
    test: [function createDrawable (context) {
        context.drawableId = context.renderer.createDrawable('sprite');
        context.drawable = context.renderer._allDrawables[context.drawableId];
        return [
            ['ok', context.drawableId >= 0, 'drawableId'],
            ['ok', Boolean(context.drawable), 'drawable'],
            ['ok', context.renderer._allDrawables.length > 0, '_allDrawables.length > 0']
        ];
    }]
});

const rendererCreateSkin = every([
    call('renderer'),
    some([
        call('rendererNewSkin'),
        call('rendererNewPenSkin')
    ]),
    value('skin'),
    call('eventsMembers'),
    call('skinInitialMembers'),
    call('postAlterSkin')
]);

const rendererChangeSkin = every([
    not(state('penSkin')),
    call('createImage'),
    some([
        rendererSVGMethod(function updateSVGSkin (context) {
            context.renderer.updateSVGSkin(context.skinId, context.imageSource);
        }),
        rendererBitmapMethod(function updateBitmapSkin (context) {
            context.renderer.updateBitmapSkin(context.skinId, context.imageSource);
        }),
        rendererTextBubbleMethod(function updateTextBubbleSkin (context) {
            const {type, text, pointsLeft} = context.textBubble;
            context.renderer.updateTextSkin(context.skinId, type, text, pointsLeft);
        })
    ])
]);

const rendererStampPenSkin = every([
    rendererNewDrawable,
    rendererNewSkin,
    evaluate({
        test: [function assignDrawableSkin (context) {
            context.drawable.skin = context.skin;
            context.stampDrawableId = context.drawableId;
            context.stampDrawable = context.drawable;
            context.stampSkinId = context.skinId;
            context.stampSkin = context.skin;
        }]
    }),
    evaluate({
        test: [function (context) {
            context.drawableId = context.penDrawableId;
            context.drawable = context.penDrawable;

            context.renderer.penClear(context.penSkinId);
            context.renderer.penStamp(context.penSkinId, context.stampDrawableId);
        }]
    })
]);

const rendererPointPenSkin = every([
    evaluate({
        test: [function (context) {
            const penAttributes = {
                diameter: 5,
                color4f: [1, 0, 0, 1]
            };

            context.renderer.penClear(context.penSkinId);
            context.renderer.penPoint(context.penSkinId, penAttributes, 50, 50);
        }]
    })
]);


const rendererLinePenSkin = every([
    evaluate({
        test: [function (context) {
            const penAttributes = {
                diameter: 5,
                color4f: [1, 0, 0, 1]
            };

            context.renderer.penClear(context.penSkinId);
            context.renderer.penLine(context.penSkinId, penAttributes, -100, -100, 100, 100);
        }]
    })
]);

const rendererDrawPenSkin = some([
    rendererPointPenSkin,
    rendererLinePenSkin,
    rendererStampPenSkin
]);

const rendererChangePenSkin = every([
    state('penSkin'),
    rendererSetLayerStageSprite,
    rendererNewDrawable,
    evaluate({
        penSkin: false,
        test: [function (context) {
            context.drawable.skin = context.skin;
            context.penDrawableId = context.drawableId;
            context.penDrawable = context.drawable;
            context.penSkinId = context.skinId;
            context.penSkin = context.penSkin;
        }]
    }),
    rendererDrawPenSkin,
    rendererDrawPenSkin
]);

const rendererUpdateSkin = every([
    rendererCreateSkin,
    some([rendererChangeSkin, rendererChangePenSkin])
]);

const rendererCreateDrawable = every([
    renderer,
    rendererSetLayerStageSprite,
    rendererNewDrawable
]);

const rendererAssignDrawableSkin = evaluate({
    test: [function assignDrawableSkin (context) {
        context.drawable.skin = context.skin;
    }]
});

const rendererSetDrawableSkin = every([
    rendererCreateDrawable,
    rendererCreateSkin,
    rendererAssignDrawableSkin
]);

const primeDrawableTransform = evaluate({
    plan: 1,
    test: [function (context) {
        context.drawable.getAABB();
        return [['equal', context.drawable._transformDirty, false, 'transform is not dirty']];
    }]
});

const drawableHasDirtyTransform = evaluate({
    plan: 2,
    test: [function drawableHasDirtyTransform (context) {
        return [
            ['ok', context.drawable.skin === context.skin, 'drawable skin updated'],
            ['ok', context.drawable._transformDirty, 'transform is dirty after skin change']
        ];
    }]
});

const rendererUpdateDrawableSkin = every([
    rendererSetDrawableSkin,
    primeDrawableTransform,
    rendererChangeSkin,
    drawableHasDirtyTransform,
    primeDrawableTransform,
    rendererChangeSkin,
    drawableHasDirtyTransform
]);

const rendererConfigureDrawable = function (config) {
    return every([
        evaluate({
            test: [function (context, config) {
                context.drawableConfig = config;
            }, config]
        }),
        renderer,
        rendererSetLayerStageSprite,
        rendererNewDrawable,
        rendererNewSkin,
        config.skin ? some(config.skin.map(check => state(check))) : null,
        rendererAssignDrawableSkin,
        evaluate({
            test: [function (context, properties) {
                context.drawable.updateProperties(properties);
            }, config.properties]
        })
    ].filter(Boolean));
};

const rendererScene = some([
    rendererSetDrawableSkin
]);

const rendererTouchingScene = every([
    some([
        every([
            rendererConfigureDrawable({
                skin: ['svgImage', 'bitmapImage'],
                properties: {position: [10, 10]}
            }),
            some([
                pass,
                evaluate({
                    test: [function (context) {
                        context.drawable.updateProperties({scale: [150, 150]});
                    }]
                })
            ]),
            rendererConfigureDrawable({
                skin: ['svgImage', 'bitmapImage'],
                properties: {position: [-10, -10]}
            }),
            some([
                pass,
                evaluate({
                    test: [function (context) {
                        context.drawable.updateProperties({scale: [150, 150]});
                    }]
                })
            ])
        ])
    ]),
    evaluate({
        test: [function draw (context) {
            document.querySelector('.test-preview').appendChild(context.canvas);
            context.renderer.draw();
        }]
    })
]);

const rendererDrawableTouching = every([
    rendererTouchingScene,
    evaluate({
        plan: 2,
        test: [function (context) {
            return [
                ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                ['ok', context.renderer.drawableTouching(context.drawableId, 240, 180), 'can touch drawable'],
            ];
        }]
    })
]);

const rendererPick = every([
    rendererTouchingScene,
    evaluate({
        plan: 2,
        test: [function (context) {
            return [
                ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                ['equal', context.renderer.pick(240, 180), context.drawableId, 'can pick drawable'],
            ];
        }]
    })
]);

const rendererIsTouchingDrawables = every([
    rendererTouchingScene,
    evaluate({
        plan: 2,
        test: [function (context) {
            return [
                ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                ['ok', context.renderer.isTouchingDrawables(context.drawableId), 'drawables are touching'],
            ];
        }]
    })
]);

const rendererIsTouchingColor = every([
    rendererTouchingScene,
    some([
        evaluate({
            test: [function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceCPU);
            }]
        }),
        evaluate({
            test: [function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.ForceGPU);
            }]
        }),
        evaluate({
            test: [function (context) {
                context.renderer.setUseGpuMode(context.module.RenderWebGL.UseGpuModes.Automatic);
            }]
        })
    ]),
    evaluate({
        plan: 3,
        test: [function isTouchingColor (context) {
            return [
                ['equal', context.renderer._allDrawables.length, 2, 'there are two drawables'],
                ['ok',
                    context.renderer.isTouchingColor(context.drawableId, [255, 171, 26]),
                    'touching orange'],
                ['ok',
                    context.renderer.isTouchingColor(context.drawableId, [0, 0, 0]),
                    'touching black'],
            ];
        }]
    })
]);

const rendererSetNativeSize = evaluate({
    test: [function (context) {
        context.renderer._setNativeSize(960, 720);
    }]
});

const rendererDraw = every([
    rendererScene,
    some([
        pass,
        rendererSetNativeSize
    ]),
    evaluate({
        test: [function draw (context) {
            document.querySelector('.test-preview').appendChild(context.canvas);
            context.renderer.draw();
        }]
    })
]);

module.exports = {
    canvas,
    renderer,
    rendererNewSkin,
    rendererNewPenSkin,
    rendererCreateSkin,
    rendererChangeSkin,
    rendererChangePenSkin,
    rendererUpdateSkin,
    rendererNewDrawable,
    rendererCreateDrawable,
    rendererSetDrawableSkin,
    rendererUpdateDrawableSkin,
    rendererDrawableTouching,
    rendererPick,
    rendererIsTouchingDrawables,
    rendererIsTouchingColor,
    rendererDraw
};

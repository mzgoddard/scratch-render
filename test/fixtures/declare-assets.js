const {pass, some, every, evaluate, optional, state, not} = require('./declare-tests');

async function loadAsset_fetch (context, name) {
    context.assetResponse = await fetch(`./assets/${name}`);
    return [
        ['comment', `fetch('./assets/${name}')`],
        ['equal', typeof context.assetResponse, 'object', 'sent asset request']
    ];
}

const loadAsset = function (name) {
    return evaluate({
        plan: 1,
        assetName: name,
        test: [loadAsset_fetch, name]
    });
};

function storeImageSize (context, size) {
    context.imageSize = size;
}

const imageSize = function (size) {
    return evaluate({
        imageSize: true,
        test: [storeImageSize, size]
    });
};

async function loadPNG_arrayBuffer (context) {
    context.imageSourceBuffer = await context.assetResponse.arrayBuffer();
    context.imageSourceBlob = new Blob([context.imageSourceBuffer], {type: 'image/png'});
    return [
        ['equal', typeof context.imageSourceBuffer, 'object', 'loaded png buffer']
    ];
}

async function loadPNG_image (context) {
    context.imageSource = await new Promise((resolve, reject) => {
        const url = URL.createObjectURL(context.imageSourceBlob);
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = url;
    });
    return [
        ['ok', context.imageSource instanceof Image, 'loaded png image']
    ];
}

async function loadPNG_canvas (context) {
    const imageCanvas = document.createElement('canvas');
    const imageContext = imageCanvas.getContext('2d');
    imageCanvas.width = context.imageSource.width;
    imageCanvas.height = context.imageSource.height;
    imageContext.drawImage(context.imageSource, 0, 0, imageCanvas.width, imageCanvas.height);
    context.imageSource = imageCanvas;
    return [
        ['ok', context.imageSource instanceof HTMLCanvasElement, 'rendered image into canvas']
    ];
}

async function loadPNG_imageBitmap (context) {
    context.imageSource = await createImageBitmap(context.imageSourceBlob);
    return [
        ['equal', typeof context.imageSource, 'object', 'loaded png imageBitmap']
    ];
}

const loadPNG = function (name, size) {
    return every([
        evaluate({bitmapImage: true}),
        loadAsset(name),
        imageSize(size),
        evaluate({imageName: name}),
        evaluate({
            plan: 1,
            test: [loadPNG_arrayBuffer]
        }),
        some([
            every([
                state('everyImageLoader'),
                evaluate({
                    plan: 1,
                    name: 'new Image',
                    test: [loadPNG_image]
                }),
                some([
                    pass,
                    evaluate({
                        plan: 1,
                        name: 'HTMLCanvasElement',
                        test: [loadPNG_canvas]
                    })
                ])
            ]),
            evaluate({
                plan: 1,
                name: 'createImageBitmap',
                test: [loadPNG_imageBitmap]
            })
        ])
    ]);
};

async function loadSVG_text (context) {
    context.imageSource = await context.assetResponse.text();
    return [
        ['equal', typeof context.imageSource, 'string', 'loaded svg string']
    ];
}

const loadSVG = function (name, size) {
    return every([
        evaluate({svgImage: true}),
        loadAsset(name),
        imageSize(size),
        evaluate({
            plan: 1,
            imageName: name,
            test: [loadSVG_text]
        })
    ]);
};

const createBitmap = some([
    loadPNG('orange50x50.png', [50, 50]),
    every([
        state('everyBitmap'),
        some([
            loadPNG('purple100x100.png', [100, 100]),
            loadPNG('gradient50x50.png', [50, 50]),
            loadPNG('gradient100x100.png', [100, 100])
        ])
    ])
]);

const createSVG = some([
    loadSVG('orange50x50.svg', [50, 50]),
    every([
        state('everySVG'),
        some([
            loadSVG('purple100x100.svg', [100, 100]),
            loadSVG('gradient50x50.svg', [50, 50]),
            loadSVG('gradient100x100.svg', [100, 100])
        ])
    ])
]);

const loadTextBubble = function (textBubble) {
    return evaluate({
        textBubble,
        imageSize: true,
        imageRotationCenter: true,
        test: [function createTextBubble (context, textBubble) {
            context.textBubble = textBubble;
            context.imageSize = textBubble.size;
            context.imageRotationCenter = [0, 0];
        }, textBubble]
    });
};

const createTextBubble = some([
    loadTextBubble({type: 'say', 'text': 'Hello World!', pointsLeft: true, size: [100, 52]}),
    every([
        state('everyTextBubble'),
        some([
            loadTextBubble({type: 'think', 'text': 'Hello World!', pointsLeft: true, size: [100, 52]}),
            loadTextBubble({type: 'say', 'text': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', pointsLeft: true, size: [192, 132]}),
            loadTextBubble({type: 'say', 'text': 'Hello World!', pointsLeft: false, size: [100, 52]}),
            loadTextBubble({type: 'say', 'text': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', pointsLeft: false, size: [192, 132]}),
            loadTextBubble({type: 'say', 'text': 'Hello\nWorld!', pointsLeft: true, size: [74, 68]}),
            loadTextBubble({type: 'say', 'text': 'Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n', pointsLeft: true, size: [189, 132]}),
            loadTextBubble({type: 'say', 'text': '', pointsLeft: true, size: [74, 52]}),
            loadTextBubble({type: 'say', 'text': 'pneumonoultramicroscopicsilicovolcanoconiosis', pointsLeft: true, size: [192, 68]})
        ])
    ])
]);

const createImage = every([
    evaluate({
        svgImage: false,
        bitmapImage: false,
        textBubble: false
    }),
    some([
        createBitmap,
        createSVG,
        createTextBubble
    ]),
    optional(every([
        not(state('svgImage')),
        state('imageSize'),
        not(state('imageRotationCenter'))
    ]), evaluate({
        imageRotationCenter: true,
        test: [function imageRotationCenter (context) {
            context.imageRotationCenter = [
                context.imageSize[0] / 2, context.imageSize[1] / 2
            ];
        }]
    }))
]);

module.exports = {
    loadPNG,
    loadSVG,
    createBitmap,
    createSVG,
    createImage
};

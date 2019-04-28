let video;
let poseNet; // This would be the machine learning model
let poses;
let emojis = [];
let neutral;

function setup() {
    createCanvas(640, 480);
    background(255);
    video = createCapture(VIDEO);
    video.hide() // hides the html element

    faceapi.load
    faceapi.loadSsdMobilenetv1Model('/models')
    faceapi.loadFaceExpressionModel('/models');

}

function draw() {
    faceapi.detectAllFaces(video.elt).withFaceExpressions()
        .then((allFaces) => {

            background(255);
            image(video, 640, 0, -640, 480)
            for (var detectionsWithExpressions of allFaces) {
                console.log(allFaces);

                let bestExpr = "";
                let max = 0;


                if (detectionsWithExpressions == undefined) {
                    console.log("No face detected");
                }
                else {
                    let face = detectionsWithExpressions.detection;
                    let exprs = detectionsWithExpressions.expressions;
                    for (let i = 0; i < exprs.length; i++) {
                        if (exprs[i].probability > max) {
                            max = exprs[i].probability;
                            bestExpr = exprs[i].expression;
                            console.log(bestExpr);
                        }
                    }
                }
            }
        });
    }
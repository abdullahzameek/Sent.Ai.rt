let video;
let poseNet; // This would be the machine learning model
let poses;
let neutral;
let transfer = false;

let style_names = ['happy', 'sad', 'angry', 'surprise', 'disgust'];
let style_key = 0;
let styles = [];


function setup() {
    createCanvas(640, 480);
    background(255);
    video = createCapture(VIDEO);
    video.hide() // hides the html element

    faceapi.load
    faceapi.loadSsdMobilenetv1Model('/models')
    faceapi.loadFaceExpressionModel('/models');

    for(let i = 0; i < style_names.length; i++){
        let model_path = "../sentiModels/" + style_names[i];
        styles[i] = ml5.styleTransfer(model_path, video, function () {
          console.log(style_names[i] + " is loaded...");
        });  
    }

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
                    //console.log("No face detected");
                }
                else {
                    let face = detectionsWithExpressions.detection;
                    let exprs = detectionsWithExpressions.expressions;
                    for (let i = 0; i < exprs.length; i++) {
                        if (exprs[i].probability > max) {
                            max = exprs[i].probability;
                            bestExpr = exprs[i].expression;
                            //console.log(bestExpr);
                        }
                    }
                }
            }
        });
    }
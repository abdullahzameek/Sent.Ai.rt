let video;
let poseNet; // This would be the machine learning model
let poses;
let neutral;
let transfer = false;

let style_names = ['happy', 'sad', 'angry', 'surprised'];
let style_key = 0;
let styles = [];

let numSongs = 5;

let happySongs = [];
let sadSongs = [];
let angrySongs = [];
let surprisedSongs = [];

var song;

let happyTitles = [
    'Dont stop me now - Queen',
    'Goodbye Yellow Brick Road - Elton John',
    'Surrender - Cheap Tricks',
    'Juice - Lizzo',
    'On The Top Of The World - Imagine Dragons',
    'Midsummer Madness - Rich Brian, 88rising, AUGUST 08, Joji',
    'Mr. Blue Sky - Electric Light Orchestra'
];

let angryTitles = [
    'Kawaki wo Ameku - Minami',
    'Na Na Na - My Chemical Romance',
    'Copycat - Billy Eilish',
    'Clique - Kanye West, Jay Z, Big Sean',
    'Paranoid Android - Radiohead',
    'I’m So Sorry - Imagine Dragons',
    'Quartier des lunes - Eddie de Pretto'
];

let sadTitles = [
    'Orange Blossom - Ya sidi',
    'Blackout - Linkin Park',
    'Fix You - Coldplay',
    'Hurt - Johnny Cash',
    'Behind Blue Eyes - Limp Bizkit',
    'Videotape - Radiohead',
    'Hurt - NIN'
]

let surprisedTitles = [
    'Tiptoe Through The Tulips - Tiny Tim',
    'Clocks - Coldplay',
    'Babooshka - Kate Bush',
    'Sleepwalker - Hey Ocean',
    'will he - joji'
]

function preload(){
    for(let k =0; k < style_names.length;k++){
        var songFolder = "../assets/audio/" + style_names[k] + "/";
        for(let j=1; j <= numSongs; j++)
        {
            if(style_names[k] === "happy")
            {
                song = loadSound(songFolder + j.toString() +".mp3");
                happySongs.push(song);
            }
            if(style_names[k] === "sad")
            {
                song = loadSound(songFolder + j.toString() +".mp3");
                sadSongs.push(song);
            }
            if(style_names[k] === "angry")
            {
                song = loadSound(songFolder + j.toString() +".mp3");
                angrySongs.push(song);
            }
            if(style_names[k] === "surprised")
            {
                song = loadSound(songFolder + j.toString() +".mp3");
                surprisedSongs.push(song);
            }
        }
    }
}


function setup() 
{
    createCanvas(windowWidth, windowHeight);
    background(0);
    video = createCapture(VIDEO);
    video.hide() // hides the html element

    //load the face API models here for sentiment analysis 
    faceapi.load
    faceapi.loadSsdMobilenetv1Model('/models')                                                                                  
    faceapi.loadFaceExpressionModel('/models');

    for(let i = 0; i < style_names.length; i++)
    {
        let model_path = "../sentiModels/" + style_names[i];
        styles[i] = ml5.styleTransfer(model_path, video, function () 
        {
          console.log(style_names[i] + " is loaded...");
        });  
    }

    output = createImg('');
    output.hide();

    style_names.push("neutral");
    console.log(style_names);   
}

function draw() 
{
    
    faceapi.detectAllFaces(video.elt).withFaceExpressions()
        .then((allFaces) => {
            background(0);
            image(video, windowWidth/3, windowHeight/12, windowWidth/3, windowHeight/1.5)
            for (var detectionsWithExpressions of allFaces)
            {
                let bestExpr = "";
                let max = 0;

                if (detectionsWithExpressions == undefined) 
                {
                    //console.log("No face detected");
                }
                else 
                {
                    let face = detectionsWithExpressions.detection;
                    let exprs = detectionsWithExpressions.expressions;
                    for (let i = 0; i < exprs.length; i++) 
                    {
                        if (exprs[i].probability > max) 
                        {
                            max = exprs[i].probability;
                            bestExpr = exprs[i].expression;
                        }
                    }
                    //we'll have to do style transfer over here
                    var styleIndex = getStyleTransfer(bestExpr);
                    if (style_names[styleIndex] === "neutral")
                    {
                        image(video, windowWidth/3, windowHeight/12, windowWidth/3, windowHeight/1.5);
                    }
                    else{
                    if(styles[styleIndex].ready){
                        styles[styleIndex].transfer(function (err, result) {
                          output.attribute('src',result.src);
                        });
                    }
                    image(output,windowWidth/3, windowHeight/12, windowWidth/3, windowHeight/1.5);
                }
            }
        }
    });
}

    
function getStyleTransfer(expression)
{
    if(style_names.includes(expression))
    {
        console.log(expression)
        return (style_names.indexOf(expression))
    } 
}

function windowResized() 
{
    resizeCanvas(windowWidth, windowHeight);
}


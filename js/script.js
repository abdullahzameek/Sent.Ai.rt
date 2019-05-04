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
var currentSong;
var song;
var songIndex = 0;
var prevStyle = "neutral";

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
    console.log("started loading music.....");
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
    currentSong = happySongs[0];
    console.log("done loading music.....");
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
                        stopSong();
                        image(video, windowWidth/3, windowHeight/12, windowWidth/3, windowHeight/1.5);
                        var prevStyle = style_names[styleIndex];

                    }
                    else{
                    if(styles[styleIndex].ready){
                        if (!(prevStyle === style_names[styleIndex])){
                            stopSong();
                            var songIndex = playSong(style_names[styleIndex])
                        }
                        styles[styleIndex].transfer(function (err, result) {
                          output.attribute('src',result.src);
                        });
                        var prevStyle = style_names[styleIndex];
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

function playSong(expression)
{
    /**
     * Okay, this one is a bit annoying. First, we'll pick a random song depending on the mood and save it to a variable. Once 
     * that's done, we'll need to pick a random start time cuz no one wants to hear the beginning. Maybe some 
     * random point between 30-75 seconds idk? 
     * Then, once thats done, we playback? Sounds easy for now woop
     * */
    var randSongIndex = Math.floor(Math.random() * 4) +1;
    var randTime = Math.floor(Math.random() * 46) +30;

    //get the song
    if(expression === "happy")
    {
        happySongs[randSongIndex].cueStart = randTime;
        happySongs[randSongIndex].play();
    }
    else if(expression === "sad")
    {
        sadSongs[randSongIndex].cueStart = randTime;
        sadSongs[randSongIndex].play();
    }
    else if(expression === "angry")
    {
        angrySongs[randSongIndex].cueStart = randTime;
        angrySongs[randSongIndex].play();
    }
    else if(expression === "surprised")
    {
        surprisedSongs[randSongIndex].cueStart = randTime;
        surprisedSongs[randSongIndex].play();
    }
    return randSongIndex
}

function stopSong()
{
    for(var p=0; p < numSongs; p++)
    {
        if(happySongs[p].isPlaying()){
            happySongs[p].stop()
        }
        if(sadSongs[p].isPlaying()){
            sadSongs[p].stop()
        }
        if(angrySongs[p].isPlaying()){
            angrySongs[p].stop()
        }
        if(surprisedSongs[p].isPlaying()){
            surprisedSongs[p].stop()
        }

    }
}
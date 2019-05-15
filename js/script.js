let video;
let poseNet; // This would be the machine learning model
let poses;
let neutral;
let transfer = true;
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
var prevStyle = "";

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
];

let surprisedTitles = [
    'Tiptoe Through The Tulips - Tiny Tim',
    'Clocks - Coldplay',
    'Babooshka - Kate Bush',
    'Sleepwalker - Hey Ocean',
    'will he - joji'
];




function preload(){
    fontNew = loadFont('assets/cour.ttf');
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
    saveThis = createGraphics(windowWidth/3.5, windowHeight/1.5);
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

    output = createImg(windowWidth/3, windowHeight/1.5);
    output.hide();

    style_names.push("neutral");
    console.log(style_names);   
}

function draw() 
{
    writeText();
    printTitle('');
    faceapi.detectAllFaces(video.elt).withFaceExpressions()
        .then((allFaces) => {
            background(0);
            image(video, windowWidth/3, windowHeight/12, windowWidth/3.5, windowHeight/1.5);
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
                        displayWords(style_names[styleIndex]);
                        image(video, windowWidth/3, windowHeight/12, windowWidth/3.5, windowHeight/1.5);
                    }
                    else{
                    if(styles[styleIndex].ready){
                        if(style_names[styleIndex] != prevStyle)
                        {
                            stopSong();
                            var songIndex = playSong(style_names[styleIndex])
                            song = getTitle(style_names[styleIndex], songIndex) 
                            print(song);
                            printTitle(song);
                            displayWords(style_names[styleIndex]);
                            styles[styleIndex].transfer(function (err, result) {
                            output.attribute('src',result.src);
                            });
                        }
                        else
                        {
                            print(song);
                            printTitle(song);
                            displayWords(style_names[styleIndex]);
                            styles[styleIndex].transfer(function (err, result) {
                            output.attribute('src',result.src);
                            });
                        }

                    }
                    image(output,windowWidth/3, windowHeight/12, windowWidth/3.5, windowHeight/1.5);

                }
                
                // console.log("Current style is ", style_names[styleIndex]);
                // console.log("Previous style is ", prevStyle);
            }
            prevStyle = style_names[styleIndex];
        }
    });
    fill(255);
    textSize(10);
    text(frameRate(), 10, 20);
}
    
function getStyleTransfer(expression)
{
    if(style_names.includes(expression))
    {
        //console.log(expression)
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
        happySongs[randSongIndex].play();
        happySongs[randSongIndex].jump(randTime);
        
    }
    else if(expression === "sad")
    {
        sadSongs[randSongIndex].play();
        sadSongs[randSongIndex].jump(randTime);
    }
    else if(expression === "angry")
    {
        angrySongs[randSongIndex].play();
        angrySongs[randSongIndex].jump(randTime);
    }
    else if(expression === "surprised")
    {
        surprisedSongs[randSongIndex].play();
        surprisedSongs[randSongIndex].jump(randTime);
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

function getTitle(expression, index)
{
    if(expression === "happy")
    {
        return happyTitles[index];
    }
    else if (expression === "sad")
    {
        return sadTitles[index];
    }
    else if(expression === "angry")
    {
        return angryTitles[index];
    }
    else if(expression === "surprised")
    {
        return surprisedTitles[index];
    }
}

function keyTyped(){
    if (key === ' '){
        console.log("tried to save image");
        var c = get(windowWidth/3, windowHeight/12, windowWidth/3.5, windowHeight/1.5)
        saveThis.image(c, 0, 0);
        save(saveThis, "Filtered.png");
        console.log("done");
    }
}   

function writeText(){
    textFont(fontNew);
    textSize(27);
    fill(255);
    text("Hit the spacebar to take a picture!", windowWidth*0.33, windowHeight*0.82);
    textSize(35);
    text("sent.ai.rt", windowWidth*0.41, windowHeight*0.05);
 }

 function printTitle(title){
    if(title == undefined){
        title = ' ';
    }
    textFont(fontNew);
    textSize(20);
    fill(255);
    text("Currently Playing: "+title, windowWidth/3, windowHeight*0.95);
 }


 let words = [
    'bliss', //0
    'joy', //1 
    'delight', //2
    'happiness', //3

    'sadness', //4
    'agony', //5
    'sorrow', //6
    'desolation', //7

    'anger',//8
    'fury',//9
    'wrath',//10
    'rage',//11

    'surprised',//12
    'shocked',//13
    'astonished',//14
    'startled'//15
];

//windowWidth/3, windowHeight/12, windowWidth/3.5, windowHeight/1.5
function displayWords(expression)
{
    console.log("the expression is "+expression);
    if(expression === "happy")
    {
        fill(255,255,random(10,200));
        textSize(28);
        text(words[0],windowWidth/6, windowHeight/2);
        text(words[1],windowWidth/12, 7*windowHeight/12);
        text(words[2],windowWidth/6+windowWidth/1.6, windowHeight/2);
        text(words[3],windowWidth/12+windowWidth/1.6, 7*windowHeight/12);
        fill(0);
        text(words[4],windowWidth/7, windowHeight/4);
        text(words[8],windowWidth/5, windowHeight/3);
        text(words[12],windowWidth/8.5, 3*windowHeight/4);
        text(words[5],windowWidth/10, 5*windowHeight/6);
        text(words[9],windowWidth/5, 2*windowHeight/5);
        text(words[13],windowWidth/9, 8*windowHeight/12);
        text(words[6],windowWidth/7+windowWidth/1.6, windowHeight/4);
        text(words[10],windowWidth/5+windowWidth/1.6, windowHeight/3);
        text(words[14],windowWidth/8.5+windowWidth/1.6, 3*windowHeight/4);
        text(words[7],windowWidth/10+windowWidth/1.6, 5*windowHeight/6);
        text(words[11],windowWidth/5+windowWidth/1.6, 2*windowHeight/5);
        text(words[15],windowWidth/9+windowWidth/1.6, 8*windowHeight/12);
    }
    if(expression === "sad")
    {
        fill(random(0,40),random(0,40), random(200,255));
        textSize(28);
        text(words[4],windowWidth/7, windowHeight/4);
        text(words[5],windowWidth/10, 5*windowHeight/6);
        text(words[6],windowWidth/7+windowWidth/1.6, windowHeight/4);
        text(words[7],windowWidth/10+windowWidth/1.6, 5*windowHeight/6);
        fill(0);
        text(words[8],windowWidth/5, windowHeight/3);
        text(words[12],windowWidth/8.5, 3*windowHeight/4);
        text(words[1],windowWidth/12, 7*windowHeight/12);
        text(words[9],windowWidth/5, 2*windowHeight/5);
        text(words[13],windowWidth/9, 8*windowHeight/12);
        text(words[2],windowWidth/6+windowWidth/1.6, windowHeight/2);
        text(words[10],windowWidth/5+windowWidth/1.6, windowHeight/3);
        text(words[14],windowWidth/8.5+windowWidth/1.6, 3*windowHeight/4);
        text(words[3],windowWidth/12+windowWidth/1.6, 7*windowHeight/12);
        text(words[11],windowWidth/5+windowWidth/1.6, 2*windowHeight/5);
        text(words[15],windowWidth/9+windowWidth/1.6, 8*windowHeight/12);
        text(words[0],windowWidth/6, windowHeight/2);
    }
    if(expression === "angry")
    {

        fill(random(200,255), random(0,40),random(0,40));
        textSize(28);
        text(words[8],windowWidth/5, windowHeight/3);
        text(words[9],windowWidth/5, 2*windowHeight/5);
        text(words[10],windowWidth/5+windowWidth/1.6, windowHeight/3);
        text(words[11],windowWidth/5+windowWidth/1.6, 2*windowHeight/5);
        fill(0);
        text(words[0],windowWidth/6, windowHeight/2);
        text(words[4],windowWidth/7, windowHeight/4);
        text(words[1],windowWidth/12, 7*windowHeight/12);
        text(words[5],windowWidth/10, 5*windowHeight/6);
        text(words[13],windowWidth/9, 8*windowHeight/12);
        text(words[2],windowWidth/6+windowWidth/1.6, windowHeight/2);
        text(words[6],windowWidth/7+windowWidth/1.6, windowHeight/4);
        text(words[14],windowWidth/8.5+windowWidth/1.6, 3*windowHeight/4);
        text(words[3],windowWidth/12+windowWidth/1.6, 7*windowHeight/12);
        text(words[7],windowWidth/10+windowWidth/1.6, 5*windowHeight/6);
        text(words[12],windowWidth/8.5, 3*windowHeight/4);
        text(words[15],windowWidth/9+windowWidth/1.6, 8*windowHeight/12);
    }

    if(expression === "surprised")
    {
        fill(245,245,245);
        textSize(28);
        text(words[12],windowWidth/8.5, 3*windowHeight/4);
        text(words[13],windowWidth/9, 8*windowHeight/12);
        text(words[14],windowWidth/8.5+windowWidth/1.6, 3*windowHeight/4);
        text(words[15],windowWidth/9+windowWidth/1.6, 8*windowHeight/12);
        fill(0);
        text(words[0],windowWidth/6, windowHeight/2);
        text(words[4],windowWidth/7, windowHeight/4);
        text(words[8],windowWidth/5, windowHeight/3);
        text(words[1],windowWidth/12, 7*windowHeight/12);
        text(words[5],windowWidth/10, 5*windowHeight/6);
        text(words[9],windowWidth/5, 2*windowHeight/5);
        text(words[2],windowWidth/6+windowWidth/1.6, windowHeight/2);
        text(words[6],windowWidth/7+windowWidth/1.6, windowHeight/4);
        text(words[10],windowWidth/5+windowWidth/1.6, windowHeight/3);
        text(words[3],windowWidth/12+windowWidth/1.6, 7*windowHeight/12);
        text(words[7],windowWidth/10+windowWidth/1.6, 5*windowHeight/6);
        text(words[11],windowWidth/5+windowWidth/1.6, 2*windowHeight/5);
        
    }
}


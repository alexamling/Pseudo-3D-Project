
/* TODO:
map loading
draw floor/background
start screen
end screen
*/


"use strict";
const app = new PIXI.Application(960,640);
app.stage = new PIXI.display.Stage();
app.stage.group.enableSort = true;
document.body.appendChild(app.view);

const sceneWidth = app.view.width;
const sceneHeight = app.view.height;
const resolution = 480;

// scene variables
let startScene;
let gameScene;
let gameGroup;
let gameOverScene;

// audio variables
let startSceneMusic;
let gameSceneMusic;
let startMusicController;
let gameMusicController;
let enemySounds = [];
let timeSinceEnemySound;
let ambientSounds = [];

let player;
let map;
let cam;

let playing = true;

// test variables
let circle;
let circle2;

Setup();

// I felt the need to make this a method in the case where the player restarts the game, 
// but that might also require a bit more modification (TODO: allow for restarting)
function Setup(){

	// #1 - Create the `start` scene
	startScene = new PIXI.Container();
	startScene.visible = false;
	app.stage.addChild(startScene);


	// #2 - Create the main `game` scene and make it invisible
	gameGroup = new PIXI.display.Group(0,true);
	app.stage.addChild(new PIXI.display.Layer(gameGroup));

	gameScene = new PIXI.Container();
	app.stage.addChild(gameScene);


	// #3 - Create the `gameOver` scene and make it invisible
	gameOverScene = new PIXI.Container();
	gameOverScene.visible = false;
	app.stage.addChild(gameOverScene);


	// #4 - Labels for the scenes


	// #5 - Load Audio
	// load in audio files
	startSceneMusic = new Howl({src: ['sounds/forest.ogg'], loop: true, volume: 0});
	gameSceneMusic = new Howl({src: ['sounds/MyVeryOwnDeadShip.ogg'], loop: true, volume: 0});

	// start the music and set up control variables
	startMusicController = startSceneMusic.play();
	gameMusicController = gameSceneMusic.play();

	// fade in the desired background music
	gameSceneMusic.fade(0,1,1000, gameMusicController);

	timeSinceEnemySound = 0;
	enemySounds.push(new Howl({src: ['sounds/fantasy-sound-library/Dragon_Growl_00.wav'], volume: 0.5}));
	enemySounds.push(new Howl({src: ['sounds/fantasy-sound-library/Dragon_Growl_01.wav'], volume: 0.5}));



	//ambientSounds.push(new Howl({src: ['sounds/horror-sound-library/Ambience_MurderOfCrows_00.wav']}));

	// #6 - Create Player
	player = new Player(0,0,135,80);
	player.position = new Vector2(5,5);


	// #7 - Create Map
	map = new Map(10);


	// #8 - Create Camera
	cam = new Camera(map, gameScene, gameGroup, sceneWidth, sceneHeight, resolution);


	// #9 - Start Game Loop
	app.ticker.add(GameLoop);


	// #00 - testing section
	/*
	circle = new PIXI.Graphics();
	circle.beginFill(0xff0000);
	circle.drawCircle(sceneWidth/2,sceneHeight/2,30);
	circle.endFill();
	circle.zOrder = 1;
	circle.parentGroup = gameGroup;
	gameScene.addChild(circle);
	
	circle2 = new PIXI.Graphics();
	circle2.beginFill(0x0000ff);
	circle2.drawCircle(sceneWidth/2,sceneHeight/2,20);
	circle2.endFill();
	circle2.zOrder = .5;
	circle2.parentGroup = gameGroup;
	gameScene.addChild(circle2);
	*/
}

function GameLoop(){
	if (!playing) return;

	// #1 - input


	// #2 - update player
	player.Update(map);


	// update camera
	cam.Update(player);


	// update enemy

	// update layering
	app.stage.updateStage();


	// chance to play an enemy sound
	if (Math.random() * 100 < timeSinceEnemySound){
		enemySounds[Math.floor(Math.random() * enemySounds.length)].play();
		timeSinceEnemySound = -10;
	}
	timeSinceEnemySound += .01; // I know it's not the number of seconds, it's juat an easy way to weight a delay

	// check if game has ended
}
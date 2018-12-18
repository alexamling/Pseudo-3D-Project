/*
Written by Alexander Amling
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
let enemy;
let map;
let cam;

let playing;

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
	LoadLabels();

	// #5 - Load Audio
	// load in audio files
	startSceneMusic = new Howl({src: ['sounds/forest.ogg'], loop: true, volume: 0});
	gameSceneMusic = new Howl({src: ['sounds/MyVeryOwnDeadShip.ogg'], loop: true, volume: 0});

	// start the music and set up control variables
	startMusicController = startSceneMusic.play();
	gameMusicController = gameSceneMusic.play();

	timeSinceEnemySound = 0;
	enemySounds.push(new Howl({src: ['sounds/fantasy-sound-library/Dragon_Growl_00.wav'], volume: 0.5}));
	enemySounds.push(new Howl({src: ['sounds/fantasy-sound-library/Dragon_Growl_01.wav'], volume: 0.5}));


	Menu();

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

function LoadLabels(){
	let title = new PIXI.Text("Torment");
	title.style = new PIXI.TextStyle({
    	fill: "#aaaaaa",
    	fontFamily: "Impact",
    	fontSize: 96,
    	fontVariant: "small-caps"
	});
	title.anchor.x = 0.5;
	title.anchor.y = 0.5;
	title.x = sceneWidth/2;
	title.y = 200;
	startScene.addChild(title);

	let controls = new PIXI.Text("move: WASD\nlook: 🡠 🡢");
	controls.style = new PIXI.TextStyle({
    	fill: "#555555",
    	fontFamily: "Impact",
    	fontSize: 24,
    	fontVariant: "small-caps"
	});
	controls.anchor.x = 0.5;
	controls.anchor.y = 0.5;
	controls.x = sceneWidth/2;
	controls.y = 350;
	startScene.addChild(controls);

	let instructions = new PIXI.Text("you have one goal: find the four keys before he finds you.");
	instructions.style = new PIXI.TextStyle({
    	fill: "#555555",
    	fontFamily: "Impact",
    	fontSize: 36,
    	fontVariant: "small-caps"
	});
	instructions.anchor.x = 0.5;
	instructions.anchor.y = 0.5;
	instructions.x = sceneWidth/2;
	instructions.y = 450;
	startScene.addChild(instructions);

	let startLabel = new PIXI.Text("press enter to start");
	startLabel.style = new PIXI.TextStyle({
    	fill: "#555555",
    	fontFamily: "Impact",
    	fontSize: 24,
    	fontVariant: "small-caps"
	});
	startLabel.anchor.x = 0.5;
	startLabel.anchor.y = 0.5;
	startLabel.x = sceneWidth/2;
	startLabel.y = 600;
	startScene.addChild(startLabel);

	let pickupCounter = new PIXI.Text("4 keys left");
	pickupCounter.style = new PIXI.TextStyle({
    	fill: "#555555",
    	fontFamily: "Impact",
    	fontSize: 24,
    	fontVariant: "small-caps"
	});
	pickupCounter.anchor.x = 0.5;
	pickupCounter.anchor.y = 0.5;
	pickupCounter.x = sceneWidth/2;
	pickupCounter.y = 600;
	gameScene.addChild(pickupCounter);
}

function Menu(){
	// #1 - set scene
	playing = false;
	startScene.visible = true;
	gameScene.visible = false;
	gameOverScene.visible = false;


	// #2 - music
	startSceneMusic.fade(0,1,1000, startMusicController); // fade in menu music
	gameSceneMusic.fade(1,0,1000, gameMusicController); // fade out game music (this is for restarting)
}

function GameOver(win){
	// #1 - set scene
	playing = false;
	startScene.visible = false;
	gameScene.visible = false;
	gameOverScene.visible = true;

}

function StartGame(){
	// #1 - set scene
	playing = true;
	startScene.visible = false;
	gameScene.visible = true;
	gameOverScene.visible = false;


	// #2 - music
	gameSceneMusic.fade(0,1,1000, gameMusicController); // fade in the game background music
	timeSinceEnemySound = 0;


	// #3 - Create Player
	player = new Player(0,0,135,80);
	player.position = new Vector2(5,5);


	// #4 - Create Enemy
	enemy = new Enemy(1, 1, gameScene, gameGroup);


	// #5 - Create Map
	map = new Map(10);


	// #6 - Create Camera
	cam = new Camera(map, enemy, gameScene, gameGroup, sceneWidth, sceneHeight, resolution);
}

function GameLoop(){
	if (!playing) {
		if (keys[keyboard.ENTER]){
			StartGame();
		}
		return;
	}
	// #1 - input


	// #2 - update player
	player.Update(map, cam);


	// update camera
	cam.Update(player);


	// update enemy

	// update layering
	app.stage.updateStage();


	// chance to play an enemy sound
	if (Math.random() * 100 < timeSinceEnemySound){
		let sound = enemySounds[Math.floor(Math.random() * enemySounds.length)]
		sound.volume(1/enemy.distFromPlayer);
		sound.play();
		timeSinceEnemySound = -10;
	}
	timeSinceEnemySound += .01; // I know it's not the number of seconds, it's juat an easy way to weight a delay

	// check if game has ended
}
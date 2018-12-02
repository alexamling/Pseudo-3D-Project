
"use strict";
const app = new PIXI.Application(480,320);
document.body.appendChild(app.view);

const sceneWidth = app.view.width;
const sceneHeight = app.view.height;
const resolution = 60;

let startScene;
let gameScene;
let gameOverScene;

let player;
let map;
let cam;

let playing = true;

Setup();

function Setup(){
	// #1 - Create the `start` scene
	startScene = new PIXI.Container();
	startScene.visible = false;
	app.stage.addChild(startScene);

	// #2 - Create the main `game` scene and make it invisible
	gameScene = new PIXI.Container();
	//gameScene.visible = false;
	app.stage.addChild(gameScene);

	// #3 - Create the `gameOver` scene and make it invisible
	gameOverScene = new PIXI.Container();
	gameOverScene.visible = false;
	app.stage.addChild(gameOverScene);

	// #4 - Labels for the scenes

	// #5 - Create Player
	player = new Player(0,0,135,90);
	player.position = new Vector2(5,5);

	// #6 - Create Map
	map = new Map(10);

	// #7 - Create Camera
	cam = new Camera(map, gameScene, sceneWidth, sceneHeight, resolution);

	// #8 - Start Game Loop
	app.ticker.add(GameLoop);
}

function GameLoop(){
	if (!playing) return;

	// update player
	//player.Update();

	// update camera
	cam.Update(player);
	player.direction -= 1;
	// check if game has ended
}

/* TODO:
input
player movement
player collisions
map loading
draw floor/background
tuning of the camera
start screen
end screen
*/
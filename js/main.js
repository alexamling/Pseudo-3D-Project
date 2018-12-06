
"use strict";
const app = new PIXI.Application(480,320);
app.stage = new PIXI.display.Stage();
app.stage.group.enableSort = true;
document.body.appendChild(app.view);

const sceneWidth = app.view.width;
const sceneHeight = app.view.height;
const resolution = 240;

let startScene;
let gameScene;
let gameGroup;
let gameOverScene;

let player;

let map;
let cam;

let playing = true;

let circle;

Setup();

function Setup(){
	// #0 - testing section
	circle = new PIXI.Graphics();
	circle.beginFill(0xff0000);
	circle.drawCircle(sceneWidth/2,sceneHeight/2,30);
	circle.endFill();
	circle.zOrder = 1;

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

	// #5 - Create Player
	player = new Player(0,0,135,80);
	player.position = new Vector2(5,5);

	// #6 - Create Map
	map = new Map(10);

	// #7 - Create Camera
	cam = new Camera(map, gameScene, gameGroup, sceneWidth, sceneHeight, resolution);

	circle.parentGroup = gameGroup;
	gameScene.addChild(circle);

	// #8 - Start Game Loop
	app.ticker.add(GameLoop);
}

function GameLoop(){
	if (!playing) return;

	// #1 - input

	// #2 - update player
	player.Update(map);

	// update camera
	cam.Update(player);

	app.stage.updateStage();
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
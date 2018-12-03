// Code based off of project written by Hunter Loftis: http://www.playfuljs.com/a-first-person-engine-in-265-lines/
// and project written by Jacob Seidelin: https://dev.opera.com/articles/3d-games-with-canvas-and-raycasting-part-1/

"use strict";

/*
Project Planning
____________________________________________________________________________________________________________________

Update(){
	input
	Player.Update() -> move | rotate
	Camera.Update() -> draw the sky | render the walls
}

Player.Update(){
	Player.Rotate();
	Player.Move();
}

Camera.Update(){
	draw sky
	RenderWalls()
}

DrawWalls(){
	subdivide POV depending on players direction, viewport size, and resolution
	Player.RayCast(vector for the direction of the cast) for each segment of the POV
	DrawWall(ray from the raycast)
}

Player.RayCast(){
	recursively step through the ray, creating a point at each gridline intersection
	inspect each step returning whe you hit a wall or edge of map
}
*/

const PI = Math.PI;

// holds the player position and direction
class Player{
	constructor(x=0,y=0, direction = 0, POV = 90){
		this.position = new Vector2(x,y);
		this.direction = direction;
		this.POV = POV;
		this.moveSpeed = .025;
		this.rotSpeed = 1;
	}
}

// method to pass the appropirate values to Rotate() and Move() based off of input values
Player.prototype.Update = function(controls, map, deltaTime) {
	this.Rotate();
	this.Move();
};
// method to adjust the players direction based off of values passed from Update()
Player.prototype.Rotate = function(angle) {
	if(keys[keyboard.LEFT]){
		this.direction -= this.rotSpeed;
	}else if(keys[keyboard.RIGHT]){
		this.direction += this.rotSpeed;
	}
};

// method to adjust palyer location based off of values passed from Update()
Player.prototype.Move = function(distance, map) {
	
	// forward/backward
	if(keys[keyboard.W]){
		this.position.x += Math.cos(this.direction * (PI/180)) * this.moveSpeed;
		this.position.y += Math.sin(this.direction * (PI/180)) * this.moveSpeed;
	}else if(keys[keyboard.S]){
		this.position.x -= Math.cos(this.direction * (PI/180)) * this.moveSpeed;
		this.position.y -= Math.sin(this.direction * (PI/180)) * this.moveSpeed;
	}
	if(keys[keyboard.A]){
		this.position.x -= Math.cos((this.direction + 90) * (PI/180)) * this.moveSpeed;
		this.position.y -= Math.sin((this.direction + 90) * (PI/180)) * this.moveSpeed;
	}else if(keys[keyboard.D]){
		this.position.x += Math.cos((this.direction + 90) * (PI/180)) * this.moveSpeed;
		this.position.y += Math.sin((this.direction + 90) * (PI/180)) * this.moveSpeed;
	}
};

// class for the rendering of the scene
class Camera{
	constructor(map, scene, sceneWidth, sceneHeight, resolution){
		this.map = map;
		this.scene = scene;
		this.resolution = resolution;
		this.sceneWidth = sceneWidth;
		this.sceneHeight = sceneHeight;
		this.wallScale = 250;
		this.walls = this.GetWalls(sceneWidth, resolution);
	}
}

Camera.prototype.GetWalls = function(sceneWidth, resolution) {
	let wallWidth = sceneWidth / resolution;
	let walls = [resolution];
	for (let i = 0; i < resolution; i++){
		walls[i] = new PIXI.Graphics();
		walls[i].beginFill(0x888888);
		walls[i].drawRect(0,0,wallWidth,1);
		walls[i].endFill();
		this.scene.addChild(walls[i]);
	}
	return walls;
};

Camera.prototype.Update = function(player) {
	// draw background
	// draw walls
	this.DrawWalls(player);
};

// method to handle drawing the background (floor and/or sky)
Camera.prototype.DrawBackground = function() {
	// static background image
};

// method to handle the drawing of the walls
Camera.prototype.DrawWalls = function(player) {
	// divide player FOV (default 90?) into desired resolution
	// for each division
	for (let i = 0; i < this.resolution; i++){
		let angle = player.direction - (player.POV / 2);
		angle = angle + ((i/this.resolution) * player.POV);
		// create new ray
		let ray = new Ray(angle);
		// give the ray the player position as the starting point
		ray.points.push(player.position);
		// raycast
		this.map.RayCast(ray);
		// change position to the nessicary position on screen
		this.walls[i].x = this.sceneWidth * (i/this.resolution);
		// scale vertically depending on the distance 
		let lastPoint = ray.points[ray.points.length - 1];
		let distance = (lastPoint.x - player.position.x) * (lastPoint.x - player.position.x);
		distance += (lastPoint.y - player.position.y) * (lastPoint.y - player.position.y);
		distance = Math.sqrt(distance);
		distance *= Math.cos((player.direction - ray.angle) * (PI/180));
		//console.log(distance);
		this.walls[i].height =  this.wallScale / distance;
		this.walls[i].y = (this.sceneHeight * .5) - (this.walls[i].height/2);
		//debugger;
	}
	//debugger;
};

// class for the state info of the scene and raycasting through the scene
class Map{
	constructor(size){
		this.size = size;
		this.wallGrid = []; // array to hold the map values
		this.Setup(); // set up the walls
	}
}

// method for checking the value of the map a given point
Map.prototype.Inspect = function(ray) {
	let point = ray.points[ray.points.length - 1];
	//debugger;
	//console.log(point.x + " | " + point.y);
	if (point.x > this.size + 1 || point.y > this.size + 1 || point.x < 0 || point.y < 0){
		console.log("Defaulted");
		debugger;
		return true;
	}
	if (point.x % 1 == 0){ // check horizontally
		if(ray.right){
			return (this.wallGrid[Math.floor(point.x)][Math.floor(point.y)] > 0 );
		}else{
			return (this.wallGrid[Math.floor(point.x)-1][Math.floor(point.y)] > 0 );
		}
	} else { // check the spaces above and below
		if(ray.up){
			return (this.wallGrid[Math.floor(point.x)][Math.floor(point.y)] > 0);
		}else{
			return (this.wallGrid[Math.floor(point.x)][Math.floor(point.y)-1] > 0);
		}
	}
};

class Ray{
	constructor(angle){
		this.points = [];
		this.angle = angle;
		this.angleSin = Math.sin(angle * (PI/180));
		this.angleCos = Math.cos(angle * (PI/180));
		this.slope = this.angleSin/this.angleCos;
		this.right = this.angleCos > 0;
		this.up = this.angleSin > 0;
	}
}

class Vector2{
	constructor(x,y){
		this.x = x;
		this.y = y;
	}
}

Map.prototype.RayCast = function(ray) {
	let newPoint;

	do{
		// create next point in a ray
		newPoint = new Vector2(0,0);

		// determine which axis the ray will hit next
		let DistToX = 0;
		let DistToY = 0;

		//console.log("rev Point: " + ray.points[ray.points.length-1].x + " | " + ray.points[ray.points.length-1].y);


		if(ray.right){
			DistToX = 1 - (ray.points[ray.points.length-1].x % 1); // get the distance from the last point to the right boundary
		} else {
			if(ray.points[ray.points.length-1].x % 1 == 0){
				DistToX = -1;
			}else{
				DistToX = -(ray.points[ray.points.length-1].x % 1); // get the distance from the last point to the left boundary
			}
			
		}

		if(ray.up){
			DistToY = 1 - (ray.points[ray.points.length-1].y % 1); // get the distance from the last point to the top boundary
		} else {
			if(ray.points[ray.points.length-1].y % 1 == 0){
				DistToY = -1;
			}else{
				DistToY = -(ray.points[ray.points.length-1].y % 1); // get the distance from the last point to the bottom boundary
			}
			
		}

		//console.log("Dist: " + DistToX + " | " + DistToY);
		//console.log("Slope: " + ray.slope);

		if(Math.abs(DistToY) > Math.abs(DistToX * ray.slope)){
			// if the horizontal boundary is closer
			//console.log("horizontal");
			newPoint.x =  Math.round(ray.points[ray.points.length - 1].x + DistToX);
			newPoint.y = ray.points[ray.points.length - 1].y + (DistToX * ray.slope);
		} else {
			// if the vertical boundary is closer
			//console.log("vertical");
			newPoint.x =  ray.points[ray.points.length - 1].x + (DistToY / ray.slope);
			newPoint.y = Math.round(ray.points[ray.points.length - 1].y + DistToY);
		}
		//debugger;
		// add point to ray
		ray.points.push(newPoint);

	} while (!this.Inspect(ray)) // exit loop when the ray hits a wall
};

Map.prototype.Setup = function() {
	// populated the map wallGrid
	// placeholder for randomized/prodecural loading
	for (let x = 0; x < this.size; x++){
		let row = [];
		for (let y = 0; y < this.size; y++) {
			if(x == 0 || x == this.size-1 || y == 0 || y == this.size-1 || Math.random() < .05){
				row.push(1);
			}else{
				row.push(0);
			}
		}
		this.wallGrid.push(row);
	}
};
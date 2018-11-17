// Code based off of project written by Hunter Loftis: http://www.playfuljs.com/a-first-person-engine-in-265-lines/
// and project written by Jacob Seidelin: https://dev.opera.com/articles/3d-games-with-canvas-and-raycasting-part-1/


/*
Project Planning
____________________________________________________________________________________________________________________

Update(){
	input
	Player.Update() -> move | rotate
	Camera.Render() -> draw the sky | render the walls
}

Player.Update(){
	Player.Rotate();
	Player.Move();
}

Camera.Render(){
	draw sky
	RenderWalls()
}

RenderWalls(){
	subdivide POV depending on players direction, viewport size, and resolution
	Player.RayCast(vector for the direction of the cast) for each segment of the POV
	DrawWall(ray from the raycast)
}

Player.RayCast(){
	step through the vector until you hit a wall or reach the edge of the map
	inspect each step returning whe you hit a wall or edge of map
}

Player.Step?

DrawWall(){
	find distance to closest wall
	draw wall with height reliant on distance from viewport
}

*/


"use strict";
// holds the player position and direction
class Player{
	constructor(x=0,y=0, direction){
		this.x = x;
		this.y = y;
		this.direction = direction;
	}
}

// method to pass the appropirate values to Rotate() and Move() based off of input values
Player.prototype.Update = function(controls, map, deltaTime) {
	// call rotate depending on mouse input
	// call move depending on WASD
};
// method to adjust the players direction based off of values passed from Update()
Player.prototype.Rotate = function(angle) {
	
};

// method to adjust palyer location based off of values passed from Update()
Player.prototype.Move = function(distance, map) {
	// body...
};

// class for the rendering of the scene
class Camera{
	constructor(scene, resolution){

	}
}

Camera.prototype.Update = function() {
	// draw background
	// draw walls
};

// method th handle drawing the background (floor and/or sky)
Camera.prototype.DrawBackground = function(direction) {
	// body...
};

// method to handle the drawing of the walls
Camera.prototype.DrawWalls = function(player, map) {
	// body...
};

Camera.prototype.DrawWall = function(ray, angle, map) {
	// body...
};

// class for the state info of the scene and raycasting through the scene
class Map{
	constructor(size){
		this.size = size;
		this.wallGrid = new Uint8Array(size * size); // array to hold the map values
	}
}

Map.prototype.RayCast = function(player, angle) {
	// determine if ray is horizontal or vertical
	// set the dX and dY appropriately
		// one will allways be 1 or -1, the other will be relative to the slope
	// set distance to 0, and step distance to the distance traveled with each dX and dY step
	// loop - recursive? step function?
		// inspect the map at the current location (floored)
		// if it is a wall, return the current ray
		// otherwise increment the x and y values of the ray by the dX dY 
		// increment the distance
};
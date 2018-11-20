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
	constructor(x=0,y=0, direction){
		this.position = new Point(x,y);
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
	constructor(map, scene, resolution){
		this.map = map;
		this.scene = scene;
		this.resolution = resolution;
	}
}

Camera.prototype.Update = function(player) {
	// draw background
	// draw walls
};

// method to handle drawing the background (floor and/or sky)
Camera.prototype.DrawBackground = function() {
	// static background image
};

// method to handle the drawing of the walls
Camera.prototype.DrawWalls = function(player) {
	// divide player FOV (default 90?) into desired resolution
	// for each division
		// create new ray
		Ray ray = new Ray(angle);
		// give the ray the player position as the starting point
		ray.points.push(player.position);
		// raycast
		map.raycast(ray);
		// create new pixi shape to retrieve from shape pool
		// change position to the nessicary position on screen
		// scale vertically depending on the distance - heigh = cos(FOVAngle) * distance;
};

// class for the state info of the scene and raycasting through the scene
class Map{
	constructor(size){
		this.size = size;
		this.wallGrid = new Uint8Array(size * size); // array to hold the map values
	}
}

// method for checking the value of the map a given point
Map.prototype.Inspect = function(point) {
	if (point.x % 1 == 0){ // check the spaces on either side horizontally
		if(wallGrid[point.y * size + point.x] > 0 || wallGrid[point.y * size + point.x - 1] > 0 ){
			return true;
		} else {
			return false;
		}
	} else { // check the spaces above and below
		if(wallGrid[point.y * size + point.x] > 0 || wallGrid[(point.y - 1) * size + point.x] > 0 ){
			return true;
		} else {
			return false;
		}
	}
};

class Ray{
	constructor(angle){
		this.points = [];
		this.angle = angle;
		this.angleSin = Math.sin(angle);
		this.angleCos = Math.cos(angle);
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

/*
	require construction for array loop start:
	Ray ray = new Ray(angle);
	ray.points.push(player.position);
*/

Map.prototype.RayCast = function(ray) {

	// create next point in a ray
	let newPoint = new Vector2(0,0);

	// determine which axis the ray will hit next
	let DistToX = 0;
	let DistToY = 0;
	if(ray.right){
		DistToX = 1 - (ray[length-1].x % 1); // get the distance from the last point to the right boundary
	} else {
		DistToX = -1 + (ray[length-1].x % 1); // get the distance from the last point to the left boundary
	}

	if(ray.up){
		DistToY = 1 - (ray[length-1].y % 1); // get the distance from the last point to the top boundary
	} else {
		DistToY = -1 + (ray[length-1].y % 1); // get the distance from the last point to the bottom boundary
	}

	if((DistToY\DistToX) > ray.slope){
		// if the vertical boundary is closer
		newPoint.x =  ray[ray.length - 1].x + DistToX;
		newPoint.y = ray[ray.length - 1].y + (DistToX * ray.slope);
	} else {
		// if horizontal boundary is closer
		newPoint.x =  ray[ray.length - 1].x + (DistToY / ray.slope);
		newPoint.y = ray[ray.length - 1].y + DistToY;
	}

	// add point to ray
	ray.points.push(newPoint);

	// inspect new point
	if (inspect(newPoint)){
		return; // exit loop when the ray hits a wall
	}

	RayCast(ray);
};
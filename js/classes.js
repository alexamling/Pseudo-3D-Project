/*
Written by Alexander Amling
Code based off of concepts from a similar project written by Hunter Loftis: http://www.playfuljs.com/a-first-person-engine-in-265-lines/
and project written by Jacob Seidelin: https://dev.opera.com/articles/3d-games-with-canvas-and-raycasting-part-1/
*/

"use strict";

/*
-- Table of Contents --
____________________________________________________________________________________________________________________

--- # 1 - Player Class ---------------------------------------------------------------------------------------------
		Constructor(x position, y position, the direction the player is facing, POV)
			also sets the player movement speed, rotation speed, and collision radius
		
		Update(the map to use for movement and collisions)
			Calls Rotate()
			Calls Move(passes the map)

		Rotate()
			rotates the player left or right depending on keyboard input

		Move(map)
			calculates the change in x and y values depending on keyboard input
			checks each axis to see if those values would cause a collision
				if they do, change the appropriate value back to 0
			applies the change

--- # 2 - Camera Class ---------------------------------------------------------------------------------------------
		Constructor(the map for the level, the scene for gameplay, the group for laying objects, 
					the width of the scene, the height of the scene, the desired rendering resolution)
			also sets the scaling to use for rendering the walls, and the distance scale to use for shading the walls
			calls GetWalls() to fetch the pool of shapes to use for rendering the walls
		
		Getwalls()
			Creates and returns an array of rectangles to use for rendering the walls

		Update(player)
			calls DrawWalls(passes the player)
			TODO: implement DrawBackground, DrawPickups, and DrawEnemies

		DrawBackground()
			CURRENTLY UNIMPLMENETED

		DrawWalls(player)
			goes through each division of the screen 
			creates a ray for that angle
			finds player distance from walls with map.Raycast(ray) 
			adjusts the height shapes in the wall pool to represent the walls
			adjusts the tint for the shapes using the distance and ToHex()


--- # 3 - Vector2 Class --------------------------------------------------------------------------------------------
		Constructor(x position, y position)

--- # 4 - Ray Class ------------------------------------------------------------------------------------------------
		Constructor(angle the ray is pointed)
			holds an array of points along the ray
			determines it's slope
			determines it's cardinal directions

--- # 5 - Map Class ------------------------------------------------------------------------------------------------
		Constructor(size of the map along one wall)
			uses Setup() to create a 2D array to hold walls
		
		Setup()
			populates the wall array of the map
			CURRENTLY PLACEHOLDER VALUES

		RayCast(ray to work with)
			steps through the map, logging every time it passes through a gridline (a potential wall) and checks the position it just hit
			when it hits a wall, it returns the ray, which now holds every intersection point
			TODO: return the spaces on the map that hold other things that need to be rendered (ei. enemies and pickups)

		Inspect(ray that is being inspected)
			looks at the last point in the array and determines if the ray has hit a wall
			returns true on a collision
			returns false otherwise

--- # 6 - Pickup Class  -------------------------------------------------------------------------------------------
		Constructor(x position, y position, scene, sprite group)
		

--- # 7 - Enemy Class  --------------------------------------------------------------------------------------------
		Constructor(x position, y position, scene, sprite group)



--- # 8 - Helper Functions -----------------------------------------------------------------------------------------
		
		ToHex(value to convert to hex) : created with reference to https://campushippo.com/lessons/how-to-convert-rgb-colors-to-hexadecimal-with-javascript-78219fdb
			creates a hexidecimal string to use as a color value for tinting

*/

const PI = Math.PI;

// # 1 - Player Class ---------------------------------------------------------------------------------------------

// holds the player position and direction
// parameters: (x position, y position, the direction the player is facing, POV)
class Player{
	constructor(x=0,y=0, direction = 0, POV = 90){
		this.position = new Vector2(x,y);
		this.direction = direction;
		this.POV = POV;
		this.moveSpeed = .025;
		this.rotSpeed = 2;
		this.collisionRadius = .25;
	}
}

// method to pass the appropirate values to Rotate() and Move() based off of input values
Player.prototype.Update = function(map, camera) {
	this.Rotate();
	this.Move(map, camera);
};

// method to adjust the players direction based off of values passed from Update()
Player.prototype.Rotate = function() {
	if(keys[keyboard.LEFT]){
		this.direction -= this.rotSpeed;
	}else if(keys[keyboard.RIGHT]){
		this.direction += this.rotSpeed;
	}

	if (this.direction > 180){
		this.direction -= 360;
	}
	if (this.direction < -180){
		this.direction += 360;
	}
};

// method to adjust palyer location based off of values passed from Update()
Player.prototype.Move = function(map, camera) {
	let dx = 0;
	let dy = 0;
	// forward/backward
	if(keys[keyboard.W]){
		// TODO: collisions // if(this.wallGrid[xpos][ypos] > 1)
		dx += Math.cos(this.direction * (PI/180)) * this.moveSpeed;
		dy += Math.sin(this.direction * (PI/180)) * this.moveSpeed;
	}if(keys[keyboard.S]){
		dx -= Math.cos(this.direction * (PI/180)) * this.moveSpeed;
		dy -= Math.sin(this.direction * (PI/180)) * this.moveSpeed;
	}
	// left/right
	if(keys[keyboard.A]){
		dx -= Math.cos((this.direction + 90) * (PI/180)) * this.moveSpeed;
		dy -= Math.sin((this.direction + 90) * (PI/180)) * this.moveSpeed;
	}if(keys[keyboard.D]){
		dx += Math.cos((this.direction + 90) * (PI/180)) * this.moveSpeed;
		dy += Math.sin((this.direction + 90) * (PI/180)) * this.moveSpeed;
	}
	// check for collisions
	let xCollisionRadius = (dx > 0) ? this.collisionRadius : -1 * this.collisionRadius;
	let yCollisionRadius = (dy > 0) ? this.collisionRadius : -1 * this.collisionRadius;
	if (map.wallGrid[Math.floor(this.position.x + dx + xCollisionRadius)][Math.floor(this.position.y)] > 0){
		dx = 0;
	}
	if (map.wallGrid[Math.floor(this.position.x)][Math.floor(this.position.y + dy + yCollisionRadius)] > 0){
		dy = 0;
	}

	// apply movement
	this.position.x += dx;
	this.position.y += dy;

	// check for pickup
	// REDO THIS WITH A FOR LOOP
	if (map.wallGrid[Math.floor(this.position.x)][Math.floor(this.position.y)] < 0){
		map.wallGrid[Math.floor(this.position.x)][Math.floor(this.position.y)] = 0;
		for (let i = 0; i < camera.pickUpPool.length; i++){
			if (camera.pickUpPool[i].x == Math.floor(this.position.x) + .5 && camera.pickUpPool[i].y == Math.floor(this.position.y) + .5){
				camera.pickUpPool[i].sprite.x = -1000;
				camera.pickUpPool.splice(i,1);
				i = camera.pickUpPool.length;
				UpdateCounter(i);
			}
		}
	}
};

// End of Player Class ---------------------------------------------------------------------------------------------



// # 2 - Camera Class ----------------------------------------------------------------------------------------------

// class for the rendering of the scene
// parameters: (the map for the level, the scene for gameplay, the group for laying objects, 
//		the width of the scene, the height of the scene, the desired rendering resolution)
class Camera{
	constructor(map, enemy, scene, group, sceneWidth, sceneHeight, resolution){
		this.map = map;
		this.scene = scene;
		this.group = group;
		this.resolution = resolution;
		this.sceneWidth = sceneWidth;
		this.sceneHeight = sceneHeight;
		this.wallScale = 250;
		this.pickUpScale = 150;
		this.shadowDistance = 20;
		this.walls = this.GetWalls(sceneWidth, resolution);
		this.pickUpPool = this.GetPickUps();
		this.enemy = enemy;
		this.DrawBackground();
	}
}

Camera.prototype.GetWalls = function() {
	let wallWidth = this.sceneWidth / this.resolution;
	let walls = [this.resolution];
	for (let i = 0; i < this.resolution; i++){
		walls[i] = new PIXI.Sprite.fromImage('images/wall_tile.png');
		walls[i].width = wallWidth;
		walls[i].height = 1;
		this.scene.addChild(walls[i]);
		walls[i].parentGroup = this.group;
	}
	return walls;
};

Camera.prototype.GetPickUps = function() {
	let pickUpPool = [map.pickUps.length];
	for (let i = 0; i < map.pickUps.length; i++){
		pickUpPool[i] = new PickUp(map.pickUps[i].x, map.pickUps[i].y, this.scene, this.group);
	}
	return pickUpPool;
};

Camera.prototype.Update = function(player) {
	// draw background
	// draw walls
	//this.background.zOrder = 1000;
	this.DrawWalls(player);
	this.DrawPickUps(player);
	this.DrawEnemy(player);
};

// method to handle drawing the background (floor and/or sky)
Camera.prototype.DrawBackground = function() {
		let backgroundSprite = new PIXI.Sprite.fromImage('images/ground.png');
		backgroundSprite.anchor.x = 0.5;
		backgroundSprite.anchor.y = 0.5;
		backgroundSprite.width = 960;
		backgroundSprite.height = 640;
		backgroundSprite.x = sceneWidth/2;
		backgroundSprite.y = sceneHeight;
		backgroundSprite.zOrder = 1000;
		backgroundSprite.parentGroup = this.group;
		this.background = backgroundSprite;
		this.scene.addChild(backgroundSprite);
};

// method to handle the drawing of the walls
Camera.prototype.DrawWalls = function(player) {
	// divide player FOV (default 90?) into desired resolution
	// for each division
	//debugger;
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
		// change image tint depending on distance
		let value = 175 - (distance * this.shadowDistance);
		this.walls[i].tint = ToHex(value);
		// change z-order depending on distance
		this.walls[i].zOrder = distance;
		this.walls[i].height =  (this.sceneHeight * .9) / distance;
		this.walls[i].y = (this.sceneHeight * .5) - (this.walls[i].height/2);
	}
};

Camera.prototype.DrawPickUps = function(player) {
	for (let i = 0; i < this.pickUpPool.length; i++){
		// culling the pickups that are out of the player's view
		let angle = Math.atan2(this.pickUpPool[i].y - player.position.y, this.pickUpPool[i].x - player.position.x) * 180/PI
		
		// Sourced from: https://stackoverflow.com/questions/12234574/calculating-if-an-angle-is-between-two-angles
		// I spent the longest time trying to get this to work
		let angleDifference = (player.direction - angle + 540) % 360 - 180;

		if (!(angleDifference <= (player.POV * .5) + 5 && angleDifference >= (player.POV * -.5) - 5)) {
			this.pickUpPool[i].sprite.x = -1000; // move the shape off screen
			continue;
		}

		// calculate distance from player
		let distance = (this.pickUpPool[i].x - player.position.x) * (this.pickUpPool[i].x - player.position.x);
		distance += (this.pickUpPool[i].y - player.position.y) * (this.pickUpPool[i].y - player.position.y);
		distance = Math.sqrt(distance);
		distance *= Math.cos((player.direction - angle) * (PI/180));

		// change image tint depending on distance
		let value = 175 - ((distance * this.shadowDistance));
		this.pickUpPool[i].sprite.tint = ToHex(value);

		// change z-order depending on distance
		this.pickUpPool[i].sprite.zOrder = distance;

		this.pickUpPool[i].sprite.height =  this.pickUpScale / distance;
		this.pickUpPool[i].sprite.width =  this.pickUpScale / distance;
	
		this.pickUpPool[i].sprite.x = (this.sceneWidth / 2) 
			- ((this.sceneWidth / 2) * (angleDifference/(player.POV * .5))) - this.pickUpPool[i].sprite.width/2;
		this.pickUpPool[i].sprite.y = (this.sceneHeight * .5) - (this.pickUpPool[i].sprite.height/2);
	}
};

Camera.prototype.DrawEnemy = function(player) {
	// culling the pickups that are out of the player's view
	let angle = Math.atan2(this.enemy.y - player.position.y, this.enemy.x - player.position.x) * 180/PI
		
	// Sourced from: https://stackoverflow.com/questions/12234574/calculating-if-an-angle-is-between-two-angles
	// I spent the longest time trying to get this to work
	let angleDifference = (player.direction - angle + 540) % 360 - 180;

	if (!(angleDifference <= (player.POV * .5) + 5 && angleDifference >= (player.POV * -.5) - 5)) {
		this.enemy.sprite.x = -1000; // move the shape off screen
		return;
	}

		// calculate distance from player
	let distance = (this.enemy.x - player.position.x) * (this.enemy.x - player.position.x);
	distance += (this.enemy.y - player.position.y) * (this.enemy.y - player.position.y);
	distance = Math.sqrt(distance);
	this.enemy.distFromPlayer = distance; // variable to use for scaling enemy sound
	distance *= Math.cos((player.direction - angle) * (PI/180));

	// change image tint depending on distance
	let value = 175 - ((distance * this.shadowDistance));
	this.enemy.sprite.tint = ToHex(value);

	// change z-order depending on distance
	this.enemy.sprite.zOrder = distance;

	this.enemy.sprite.height =  400 / distance;
	this.enemy.sprite.width =  400 / distance;
	
	this.enemy.sprite.x = (this.sceneWidth / 2) 
		- ((this.sceneWidth / 2) * (angleDifference/(player.POV * .5))) - this.enemy.sprite.width/2;
	this.enemy.sprite.y = (this.sceneHeight * .5) - (this.enemy.sprite.height/2);};

// End of Camera Class ---------------------------------------------------------------------------------------------



// # 3 - Vector2 Class ---------------------------------------------------------------------------------------------

class Vector2{
	constructor(x,y){
		this.x = x;
		this.y = y;
	}
}

// End of Vector2 Class --------------------------------------------------------------------------------------------



// # 4 - Ray Class -------------------------------------------------------------------------------------------------

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

// End of Ray Class ------------------------------------------------------------------------------------------------



// # 5 - Map Class -------------------------------------------------------------------------------------------------

// class for the state info of the scene and raycasting through the scene
class Map{
	constructor(size){
		this.size = size;
		this.wallGrid = []; // array to hold the map values
		this.pickUps = []; // array to hold pickup objects
		this.Setup(); // set up the walls and pickups
	}
}

Map.prototype.Setup = function() {
	// set map
	this.pickUps = [
	new Vector2(22,2),
	new Vector2(22,17),
	new Vector2(5,17),
	new Vector2(6,21)];

	this.wallGrid = [
	[1, 1, 1, 1, 1,  1, 1, 1, 1, 1,  1, 1, 1, 1, 1,  1, 1, 1, 1, 1,  1, 1, 1, 1, 1],
	[1, 0, 0, 0, 0,  0, 1, 0, 0, 0,  1, 0, 0, 0, 1,  0, 0, 0, 0, 0,  1, 0, 1, 0, 1],
	[1, 0, 1, 0, 1,  0, 1, 0, 1, 0,  1, 0, 1, 0, 0,  0, 1, 0, 1, 0,  0, 0, 1, 0, 1],
	[1, 0, 1, 0, 1,  0, 1, 0, 1, 0,  0, 0, 1, 0, 1,  0, 1, 0, 1, 0,  1, 1, 1, 0, 1],
	[1, 0, 1, 0, 1,  0, 1, 0, 1, 0,  1, 0, 1, 0, 1,  0, 1, 0, 1, 0,  0, 0, 0, 0, 1],

	[1, 0, 1, 0, 1,  0, 1, 0, 1, 0,  1, 0, 0, 0, 1,  0, 0,-1, 1, 0,  1, 1, 1, 1, 1],
	[1, 0, 0, 0, 1,  0, 1, 0, 1, 1,  1, 1, 1, 0, 1,  1, 1, 1, 1, 0,  1,-1, 0, 0, 1],
	[1, 0, 1, 1, 1,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 1, 0,  1, 1, 1, 0, 1],
	[1, 0, 0, 0, 1,  0, 0, 0, 0, 0,  1, 1, 0, 1, 1,  0, 0, 0, 1, 0,  0, 0, 0, 0, 1],
	[1, 0, 1, 0, 1,  0, 1, 0, 0, 1,  0, 0, 0, 0, 0,  1, 0, 0, 1, 0,  1, 1, 1, 0, 1],

	[1, 0, 1, 0, 1,  0, 1, 0, 1, 0,  0, 0, 0, 0, 0,  0, 1, 0, 1, 0,  0, 0, 1, 0, 1],
	[1, 0, 1, 0, 0,  0, 1, 0, 1, 0,  0, 0, 0, 0, 0,  0, 1, 0, 1, 0,  1, 1, 1, 0, 1],
	[1, 0, 1, 1, 1,  0, 1, 0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 1, 0,  0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0,  0, 1, 0, 1, 0,  0, 0, 0, 0, 0,  0, 1, 0, 1, 0,  1, 1, 1, 0, 1],
	[1, 1, 1, 0, 1,  0, 1, 0, 1, 0,  0, 0, 0, 0, 0,  0, 1, 0, 1, 0,  1, 0, 0, 0, 1],

	[1, 0, 0, 0, 0,  0, 1, 0, 0, 1,  0, 0, 0, 0, 0,  1, 0, 0, 1, 0,  1, 1, 1, 0, 1],
	[1, 0, 1, 1, 1,  0, 1, 0, 0, 0,  1, 1, 0, 1, 1,  0, 0, 0, 0, 0,  0, 0, 0, 0, 1],
	[1, 0, 1, 0, 1,  0, 1, 0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 1],
	[1, 0, 1, 0, 1,  0, 1, 1, 1, 1,  1, 0, 0, 0, 1,  1, 1, 1, 1, 1,  1, 1, 1, 0, 1],
	[1, 0, 1, 0, 0,  0, 1, 0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 1],

	[1, 0, 1, 1, 1,  0, 1, 0, 1, 0,  1, 1, 1, 0, 1,  0, 1, 1, 1, 0,  1, 0, 1, 0, 1],
	[1, 0, 0, 0, 1,  0, 1, 0, 1, 0,  0, 0, 1, 0, 1,  0, 0, 0, 1, 0,  1, 0, 0, 0, 1],
	[1, 0,-1, 0, 1,  0, 1, 0, 1, 1,  1, 0, 1, 0, 1,  1, 1,-1, 1, 0,  1, 1, 1, 0, 1],
	[1, 0, 0, 0, 1,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 1],
	[1, 1, 1, 1, 1,  1, 1, 1, 1, 1,  1, 1, 1, 1, 1,  1, 1, 1, 1, 1,  1, 1, 1, 1, 1],
	]
	/*
	for (let x = 0; x < this.size; x++){
		let row = [];
		for (let y = 0; y < this.size; y++) {
			if(x == 0 || x == this.size-1 || y == 0 || y == this.size-1 || Math.random() < .05){
				row.push(1);
			}else if (Math.random() < .05){
				row.push(-1); // mark this spot on the grid
				this.pickUps.push(new Vector2(x,y)); // pass the location to the pickup arr
			}else{
				row.push(0);
			}
		}
		this.wallGrid.push(row);
	}*/
};

Map.prototype.RayCast = function(ray) {
	let newPoint;

	do{
		// create next point in a ray
		newPoint = new Vector2(0,0);

		// determine which axis the ray will hit next
		let DistToX = 0;
		let DistToY = 0;


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

		if(Math.abs(DistToY) > Math.abs(DistToX * ray.slope)){
			// if the horizontal boundary is closer
			newPoint.x =  Math.round(ray.points[ray.points.length - 1].x + DistToX);
			newPoint.y = ray.points[ray.points.length - 1].y + (DistToX * ray.slope);
		} else {
			// if the vertical boundary is closer
			newPoint.x =  ray.points[ray.points.length - 1].x + (DistToY / ray.slope);
			newPoint.y = Math.round(ray.points[ray.points.length - 1].y + DistToY);
		}

		// add point to ray
		ray.points.push(newPoint);

	} while (!this.Inspect(ray)) // exit loop when the ray hits a wall
};

// method for checking the value of the map a given point
Map.prototype.Inspect = function(ray) {
	let point = ray.points[ray.points.length - 1];
	// exit loop if ray has left the bounds of the scene
	if (point.x > this.size + 1 || point.y > this.size + 1 || point.x < 0 || point.y < 0){
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

// End of Map Class ------------------------------------------------------------------------------------------------



// # 6 - Pickup Class ----------------------------------------------------------------------------------------------
class PickUp{
	constructor(x,y, scene, group){
		this.x = x + .5;
		this.y = y + .5;
		this.sprite = new PIXI.Sprite.fromImage('images/key_1.png');
		this.sprite.x = sceneWidth/2;
		this.sprite.y = sceneHeight/2;
		this.sprite.width = 10;
		this.sprite.height = 10;
		scene.addChild(this.sprite);
		this.sprite.parentGroup = group;
	}
}

// End of Pickup class --------------------------------------------------------------------------------------------



// # 7 - Enemy Class ----------------------------------------------------------------------------------------------
class Enemy{
	constructor(x,y, scene, group){
		this.x = x + .5;
		this.y = y + .5;
		this.speed = .015;
		this.sprite = new PIXI.Sprite.fromImage('images/ghost.png');
		this.sprite.x = sceneWidth/2;
		this.sprite.y = sceneHeight/2;
		this.sprite.width = 10;
		this.sprite.height = 10;
		this.sprite.alpha = .75;
		scene.addChild(this.sprite);
		this.sprite.parentGroup = group;
		this.distFromPlayer = 1;
	}
}

Enemy.prototype.Update = function(player) {

    if (Math.abs(player.position.x - this.x) < Math.abs(player.position.y - this.y)){  
    	if (Math.abs(player.position.x - this.x) > .1)
    		this.x += (player.position.x > this.x) ? this.speed : -1 * this.speed;
    	else
    		this.y += (player.position.y > this.y) ? this.speed : -1 * this.speed;
    } else {
    	if(Math.abs(player.position.y - this.y) > .1)
    		this.y += (player.position.y > this.y) ? this.speed : -1 * this.speed;
    	else{
    		this.x += (player.position.x > this.x) ? this.speed : -1 * this.speed;
    	}
    }
};
// End of Pickup class --------------------------------------------------------------------------------------------



// # 8 - Helper Functions ------------------------------------------------------------------------------------------

/* referred to: https://campushippo.com/lessons/how-to-convert-rgb-colors-to-hexadecimal-with-javascript-78219fdb */
function ToHex(value){
	let hex;
	value = Math.floor(value);
	if(value < 0){
		hex = "00";
	} else {
		hex = value.toString(16);
		if (hex.length < 2) {
			hex = "0" + hex;
		}	
	}
	return "0x" + hex + hex + hex;
}

// End of Helper Functions -----------------------------------------------------------------------------------------
# Pseudo-3D-Project
This project was focused on replicating the "3D" raycasting engines used in games such as Wolfenstein 3D.
The game can be played here: <https://people.rit.edu/aja7073/230/project1/game.html>

### Background
This project was done as an assignment for RIT IGME 230 - Web Design and Implementation. 
Our goal was to create a web game using the PixiJS 2D graphics engine, other than that, we could take our projects in whatever direction we want.

I took this assignment as a oppurtunity to complete a project I had been thinking of doing for a while 
and make a pseudo 3D raycasting engine. It seemed like the perfect oppurtunity, because I was locked 
into using a 2D graphics library, and had the time to work beyond the techniques and concepts we had been 
taught in class.

Being required to work with PixiJS (and told not to use canvas) had it's advantages and disadvantages. There was 
a lot of utility that went unused, but it provided a simple way to move sprites, set up multiple scenes, and the addition of 
an additional PixiJS plugin made the sprite layering process easier.

### Brief Overview of the Raycasting Rendering Process
the camera divides the screen into subsections
```javascript
for (let i = 0; i < this.resolution; i++){
		let angle = player.direction - (player.POV / 2);
		angle = angle + ((i/this.resolution) * player.POV);
```

the camera sends a ray out in the angle of each subsection
```javascript
		// create new ray
		let ray = new Ray(angle);
		// give the ray the player position as the starting point
		ray.points.push(player.position);
		// raycast
		this.map.RayCast(ray);
```    

the ray steps through the grid, stopping at each grid line
```javascript
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
```

every time the ray crosses a gridline, it inspects that point on the grid to see if it has hit a wall
```javascript
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
```

the the camera adjusts the sprites for the walls depending on distance from the player
```javascript
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
  ```
  
  ### Resources
  #### References for Rendering
  <https://itstillworks.com/12314899/history-of-the-first-3d-video-games>
  
  <https://dev.opera.com/articles/3d-games-with-canvas-and-raycasting-part-1>
  
  <http://www.playfuljs.com/a-first-person-engine-in-265-lines>
  
  #### Images
  <https://opengameart.org/content/2d-gem-set-32x32>
  
  <https://opengameart.org/content/grue>
  
  <https://opengameart.org/content/key-icons>
  
  #### Audio
  <https://opengameart.org/content/creepy-forest-f>
  
  <https://opengameart.org/content/fantasy-sound-effects-library>
  
  <https://opengameart.org/content/background-space-track>
  
  <https://opengameart.org/content/horror-sound-effects-library>

// code from class-provided example
// important keycodes
const keyboard = Object.freeze({
	SHIFT: 16,
	SPACE: 32,
	LEFT:  37,
	RIGHT: 39,
	UP:    38,
	DOWN:  40,
	W:     87,
	A:     65,
	S:     83,
	D:     68
});

// collection of keys to poll every frame
let keys = [];

window.onkeyup = (e) =>{
	keys[e.keyCode] = false;
	e.preventDefault();
};

window.onkeydown = (e) =>{
	keys[e.keyCode] = true;
}
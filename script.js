var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

var preview = document.getElementById('preview');
var previewctx = preview.getContext('2d');

var MDown = false;
var Color = '#f3a358';


// Tools
// -----------------------------------------------------------
// COLOUR PALETTES
var palette = document.getElementById('selectedcolor');
palette.style.backgroundColor = Color;

var brushcolors = document.getElementById('brushcolors');
if (brushcolors.children.length > 0)
{
	var children = brushcolors.getElementsByTagName("div");
	for (var i = 0; i < children.length; i++)
	{
		children[i].onclick = function() {
			palette.style.backgroundColor = this.style.backgroundColor;
			Color = palette.style.backgroundColor;
		};
	}
}

// -----------------------------------------------------------
// SAVE BUTTON

var saveButton = document.getElementById('savebutton');
var saveDiv = document.getElementById('savefile');
var saveImg = document.getElementById('saveimg');

saveDiv.style.display = 'none';

saveButton.onclick = function() {
//	Canvas2Image.saveAsPNG(canvas);
	var oImgPNG = Canvas2Image.saveAsPNG(canvas, true);
	saveDiv.style.display = 'block';
	
	var dialogWidth = Math.max(canvas.width + 10, 200);
	saveDiv.style.width = dialogWidth + "px";
	
	saveImg.innerHTML = '';
	saveImg.appendChild(oImgPNG);
}

var closeSaveFile = document.getElementById('closeSaveFile');

closeSaveFile.onclick = function() {
	saveDiv.style.display = 'none';
}

// -----------------------------------------------------------
// FILL BUTTON
var fillButton = document.getElementById('fillbutton');
fillButton.onclick = function() {
	context.rect(0,0,canvas.width, canvas.height);
	context.fillStyle=Color;
	context.fill();

	previewctx.rect(0,0,preview.width, preview.height);
	previewctx.fillStyle=Color;
	previewctx.fill();
}

// -----------------------------------------------------------
// CLEAR BUTTON
var clearButton = document.getElementById('clearbutton');
clearButton.onclick = function() {
	context.setTransform(1, 0, 0, 1, 0, 0);
	context.clearRect(0, 0, canvas.width, canvas.height);

	previewctx.setTransform(1, 0, 0, 1, 0, 0);
	previewctx.clearRect(0, 0, preview.width, preview.height);
}


// -----------------------------------------------------------
var curX = 0;	// current X co-ordinate
var curY = 0;	// current Y co-ordinate
// Top left co-ordinates of canvas
var canvasX0 = 0;
var canvasY0 = 0;
// Bottom right co-ordinates of canvas
var canvasX1 = canvasX0 + canvas.width;
var canvasY1 = canvasY0 + canvas.height;
// Top left co-ordinates of canvas within window
var winCanvasX = Position(canvas).left;
var winCanvasY = Position(canvas).top;

var cWidth = canvas.width;
var cHeight = canvas.height;
var pWidth = preview.width;
var pHeight = preview.height;
var pCenterStartX = (pWidth - cWidth) / 2;
var pCenterStartY = (pHeight - cHeight) / 2;
var pStartX = pCenterStartX - ((Math.ceil(pCenterStartX/cWidth)) * cWidth);
var pStartY = pCenterStartY - ((Math.ceil(pCenterStartY/cHeight)) * cHeight);

canvas.onselectstart = function() { return false; };
canvas.unselectable = "on";
canvas.style.MozUserSelect = "none";

// -----------------------------------------------------------

canvas.onmousedown = function(e) {
	MDown = true;
	context.strokeStyle = Color;
	context.lineCap = 'round';
	var winCanvasX = Position(canvas).left;
	var winCanvasY = Position(canvas).top;

	context.lineWidth = 50;
	context.beginPath();
	
	curX = e.pageX - winCanvasX;
	curY = e.pageY - winCanvasY;
	
	context.moveTo(curX, curY);
}

// -----------------------------------------------------------

window.onmouseup = function()
{
	MDown = false;
	UpdatePreview();
};

// -----------------------------------------------------------

window.onmousemove = function(e) { 
	if (MDown) {
		
		var nextX = e.pageX - winCanvasX;
		var nextY = e.pageY - winCanvasY;
		
		// Calculate if we go outside bounds of canvas
		var newX1 = curX, newX2 = nextX, newY1 = curY, newY2 = nextY;
		var reflect = false;
		
		if (nextX < canvasX0)
		{
			newX1 = curX + cWidth;
			newX2 = nextX + cWidth;
			reflect = true;
		} else if (nextX > canvasX1) {
			newX1 = curX - cWidth;
			newX2 = nextX - cWidth;
			reflect = true;
		}

		if (nextY < canvasY0)
		{
			newY1 = curY + cHeight;
			newY2 = nextY + cHeight;
			reflect = true;
		} else if (nextY > canvasY1) {
			newY1 = curY - cHeight;
			newY2 = nextY - cHeight;
			reflect = true;
		}
		
		context.lineTo(nextX, nextY);
		if (reflect)
		{
			context.moveTo(newX1, newY1);
			context.lineTo(newX2, newY2);
		}
		context.lineWidth = 50;
		context.stroke();
		context.moveTo(nextX, nextY);	// Replace position
		
		curX = nextX; curY = nextY;
	}
}

// -----------------------------------------------------------

function Position(el) {
	var position = {left: 0, top: 0};
	if (el) {
		if (!isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
			position.left += el.offsetLeft;
			position.top += el.offsetTop;
		}
	}
	return position;
}	

// -----------------------------------------------------------

function UpdatePreview() {
	for (var y=pStartY; y<preview.height; y+=cHeight)
	{
		for (var x=pStartX; x<preview.width; x+=cWidth)
		{
			previewctx.drawImage(canvas, x, y);
		}
	}
}
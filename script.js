"use strict";

var app = {};
(function(app){
    app.canvas = document.getElementById('canvas');
    app.context = app.canvas.getContext('2d');
    app.preview = document.getElementById('preview');
    app.previewctx = app.preview.getContext('2d');
    app.mouse_down = false;
    app.current_color = '#f3a358';
    app.brush_size = 10;
})(app);

// Tools
// -----------------------------------------------------------
// COLOUR PALETTES
var palette = document.getElementById('selectedcolor');
palette.style.backgroundColor = app.current_color;

var brushcolors = document.getElementById('brushcolors');
if (brushcolors.children.length > 0) {
  var children = brushcolors.getElementsByTagName("div");
  for (var i = 0; i < children.length; i++) {
    children[i].onclick = function () {
      palette.style.backgroundColor = this.style.backgroundColor;
      app.current_color = palette.style.backgroundColor;
    };
  }
}

// -----------------------------------------------------------
// SAVE BUTTON

var saveButton = document.getElementById('savebutton');
var saveDiv = document.getElementById('savefile');
var saveImg = document.getElementById('saveimg');

saveDiv.style.display = 'none';

saveButton.onclick = function () {
  // Canvas2Image.saveAsPNG(canvas);
  var oImgPNG = Canvas2Image.saveAsPNG(app.canvas, true);
  saveDiv.style.display = 'block';

  var dialogWidth = Math.max(app.canvas.width + 10, 200);
  saveDiv.style.width = dialogWidth + "px";

  saveImg.innerHTML = '';
  saveImg.appendChild(oImgPNG);
}

var closeSaveFile = document.getElementById('closeSaveFile');

closeSaveFile.onclick = function () {
  saveDiv.style.display = 'none';
}

// -----------------------------------------------------------
// FILL BUTTON
var fillButton = document.getElementById('fillbutton');
fillButton.onclick = function () {
  app.context.rect(0, 0, app.canvas.width, app.canvas.height);
  app.context.fillStyle = app.current_color;
  app.context.fill();

  app.previewctx.rect(0, 0, app.preview.width, app.preview.height);
  app.previewctx.fillStyle = app.current_color;
  app.previewctx.fill();
}

// -----------------------------------------------------------
// CLEAR BUTTON
var clearButton = document.getElementById('clearbutton');
clearButton.onclick = function () {
  app.context.setTransform(1, 0, 0, 1, 0, 0);
  app.context.clearRect(0, 0, app.canvas.width, app.canvas.height);

  app.previewctx.setTransform(1, 0, 0, 1, 0, 0);
  app.previewctx.clearRect(0, 0, app.preview.width, app.preview.height);
}


// -----------------------------------------------------------
var curX = 0; // current X co-ordinate
var curY = 0; // current Y co-ordinate
// Top left co-ordinates of canvas
var canvasX0 = 0;
var canvasY0 = 0;
// Bottom right co-ordinates of canvas
var canvasX1 = canvasX0 + app.canvas.width;
var canvasY1 = canvasY0 + app.canvas.height;
// Top left co-ordinates of canvas within window
var winCanvasX = Position(app.canvas).left;
var winCanvasY = Position(app.canvas).top;

var cWidth = app.canvas.width;
var cHeight = app.canvas.height;
var pWidth = app.preview.width;
var pHeight = app.preview.height;
var pCenterStartX = (pWidth - cWidth) / 2;
var pCenterStartY = (pHeight - cHeight) / 2;
var pStartX = pCenterStartX - ((Math.ceil(pCenterStartX / cWidth)) * cWidth);
var pStartY = pCenterStartY - ((Math.ceil(pCenterStartY / cHeight)) * cHeight);

app.canvas.onselectstart = function () { return false; };
app.canvas.unselectable = "on";
app.canvas.style.MozUserSelect = "none";

// -----------------------------------------------------------

app.canvas.onmousedown = function (e) {
  app.mouse_down = true;
  app.context.strokeStyle = app.current_color;
  app.context.lineCap = 'round';
  var winCanvasX = Position(app.canvas).left;
  var winCanvasY = Position(app.canvas).top;

  app.context.lineWidth = app.brush_size;
  app.context.beginPath();

  curX = e.pageX - winCanvasX;
  curY = e.pageY - winCanvasY;

  app.context.moveTo(curX, curY);
}

// -----------------------------------------------------------

window.onmouseup = function () {
  app.mouse_down = false;
  UpdatePreview();
};

// -----------------------------------------------------------

window.onmousemove = function (e) {
  if (app.mouse_down) {

    var nextX = e.pageX - winCanvasX;
    var nextY = e.pageY - winCanvasY;

    // Calculate if we go outside bounds of canvas
    var newX1 = curX, newX2 = nextX, newY1 = curY, newY2 = nextY;
    var reflect = false;

    if (nextX < canvasX0) {
      newX1 = curX + cWidth;
      newX2 = nextX + cWidth;
      reflect = true;
    } else if (nextX > canvasX1) {
      newX1 = curX - cWidth;
      newX2 = nextX - cWidth;
      reflect = true;
    }

    if (nextY < canvasY0) {
      newY1 = curY + cHeight;
      newY2 = nextY + cHeight;
      reflect = true;
    } else if (nextY > canvasY1) {
      newY1 = curY - cHeight;
      newY2 = nextY - cHeight;
      reflect = true;
    }

    app.context.lineTo(nextX, nextY);
    if (reflect) {
      app.context.moveTo(newX1, newY1);
      app.context.lineTo(newX2, newY2);
    }
    app.context.lineWidth = app.brush_size;
    app.context.stroke();
    app.context.moveTo(nextX, nextY); // Replace position

    curX = nextX; curY = nextY;
  }
}

// -----------------------------------------------------------

function Position(el) {
  var position = { left: 0, top: 0 };
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
  for (var y = pStartY; y < app.preview.height; y += cHeight) {
    for (var x = pStartX; x < app.preview.width; x += cWidth) {
      app.previewctx.drawImage(app.canvas, x, y);
    }
  }
}
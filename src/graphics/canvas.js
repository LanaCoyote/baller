var MainCanvas = null;
var MainContext = null;

var bgImage = new Image();

function SetMainCanvas( cvs ) {

  MainCanvas = cvs;
  MainContext = cvs.getContext( "2d" );

  return MainCanvas;

}

function GetMainCanvas() {

  return MainCanvas;

}

function GetMainContext() {

  return MainContext;

}

function CreateCanvasElement( width, height, main ) {

  var cvs = document.createElement( "canvas" );
  cvs.width = width;
  cvs.height = height;

  bgImage.onload = function() {
    bgImage.ready = true;
  }
  bgImage.src = "static/images/court.jpg";

  if ( main || main === undefined ) SetMainCanvas( cvs );

  return cvs;

}

function VecToScreenSpace( vec ) {

  var newVec = { x: vec.x * 32, y: vec.y * 32 };
  return newVec;

}

function Clear() {

  var cvs = GetMainCanvas();
  //GetMainContext().clearRect( 0, 0, cvs.width, cvs.height );
  if ( bgImage.ready ) GetMainContext().drawImage( bgImage, 0, 0, cvs.width, cvs.height );
  else GetMainContext().clearRect( 0, 0, cvs.width, cvs.height );

}

module.exports = {

  CreateCanvasElement : CreateCanvasElement,

  SetMainCanvas : SetMainCanvas,
  GetMainCanvas : GetMainCanvas,
  GetMainContext : GetMainContext,

  VecToScreenSpace : VecToScreenSpace,
  Clear: Clear,

}
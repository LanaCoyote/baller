(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
var Canvas = require('./canvas');

var FirstSprite = null;
var LastSprite = null;

function DrawAllSprites() {

  for ( var spr = FirstSprite; spr; spr = spr.getNext() ) {
    spr.draw();
  }

}

function SpriteOptions( options ) {

  this.visible = true;
  this.flipHorizontal = false;
  this.flipVertical = false;
  this.getPos = function() { return { x: 0, y: 0 } };
  this.getAng = function() { return 0 };

  for ( var o in options ) {
    this[o] = options[o];
  }

}

function SetSpriteTail( sprite ) {

  if ( LastSprite === null ) {
    FirstSprite = sprite;
  } else {
    LastSprite.setNext( sprite );
  }

  LastSprite = sprite;

}

function Sprite( image, options ) {

  // set up sprite options
  this.options = new SpriteOptions( options );

  // load our image
  this.loaded = false;
  this.image = new Image();
  this.image.onload = (function() {

    this.loaded = true;

    if ( this.width === undefined ) this.width = this.image.width;
    if ( this.height === undefined ) this.height = this.image.height;

  }).bind( this );
  this.image.src = this.src = image;

  // push this sprite onto the sprite list
  SetSpriteTail( this );

}

Sprite.prototype.isVisible = function() {

  return this.loaded && this.options.visible;

}

Sprite.prototype.getPos = function() {

  return this.options.getPos();

}

Sprite.prototype.getAng = function() {

  return this.options.getAng();

}

Sprite.prototype.getNext = function() {

  return this._next || null;

}

Sprite.prototype.setNext = function( spr ) {

  this._next = spr;

}

Sprite.prototype.draw = function() {

  if ( this.isVisible() ) {

    // get the current context and save the transform matrix
    var ctx = Canvas.GetMainContext();
    ctx.save();

    // compute a new transform matrix
    var pos = Canvas.VecToScreenSpace( this.options.getPos() );
    // console.log( pos.x, pos.y );
    ctx.translate( pos.x, pos.y );
    ctx.rotate( this.getAng() );

    // var width = (this.options.flipHorizontal ? -this.width/this.image.width : this.width/this.image.width );
    // var height = (this.options.flipVertical ? -this.height/this.image.height : this.height/this.image.height );

    ctx.scale( this.options.flipHorizontal ? -1 : 1, this.options.flipVertical ? -1 : 1 );

    // draw it!
    ctx.drawImage( this.image, this.width/-2, this.height/-2, this.width, this.height );

    // retore the canvas to its earlier state
    ctx.restore();

  }

}

Sprite.prototype.destroy = function() {

  if ( FirstSprite === this ) {

    FirstSprite = this.getNext();

  } else {
    for( var spr = FirstSprite; spr; spr = spr.getNext() ) {

      if ( spr.getNext() === this ) {
        spr.setNext( this.getNext() );
      }

    }
  }

  this.setNext( null );
  this.deleted = true;
  this.image = null;

}

module.exports = Sprite;
module.exports.DrawAll = DrawAllSprites;
},{"./canvas":1}],3:[function(require,module,exports){
var Baller = require('./objects/baller');
var Basketball = require('./objects/basketball');
var Canvas = require('./graphics/canvas');
var Input = require('./utils/input');
var PhysHelpers = require('./physics/helper');
var Sprite = require('./graphics/sprite');

var w = window;
var requestAnimFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

function initialize() {

  var canvas = Canvas.CreateCanvasElement( 800, 400, true );
  document.body.appendChild( canvas );

  var input = new Input( window );

  PhysHelpers.CreateWorld();

  // create floor
  var floorFixDef = PhysHelpers.BoxFixtureDef( 25, 1 );
  var floor = PhysHelpers.StaticBodyFromFixtureDef( floorFixDef, new Box2D.Common.Math.b2Vec2( 12.5, 12 ) );

  for ( var j = 5; j > 0; --j ) {
    for ( var i = 0; i < j; ++i ) {
      var bball = new Basketball( 
        new Box2D.Common.Math.b2Vec2( 15 + ((5-j)/2) + i, 6 + j ),
        new Box2D.Common.Math.b2Vec2( 0, 0 )
      );

      bball.physics.SetAwake( false );
    }
  }

  var baller = new Baller( new Box2D.Common.Math.b2Vec2( 2, 2 ) );

  input.addBindOnPress( 32, function() {
    var throwPoint = new Box2D.Common.Math.b2Vec2( Math.sin( baller.physics.GetAngle() ) * 3, Math.cos( baller.physics.GetAngle() ) * -3 );
    throwPoint.Add( baller.physics.GetPosition() )

    new Basketball(
      throwPoint,
      new Box2D.Common.Math.b2Vec2( 10, -10 )
    )
  });

  input.addBindOnPress( 39, function() {
    baller.physics.ApplyForce( new Box2D.Common.Math.b2Vec2( 1000, 0 ), baller.physics.GetWorldCenter() );
  })

  input.addBindOnPress( 37, function() {
    baller.physics.ApplyForce( new Box2D.Common.Math.b2Vec2( -1000, 0 ), baller.physics.GetWorldCenter() );
  })

  input.addBindOnPress( 38, function() {
    baller.physics.ApplyImpulse( new Box2D.Common.Math.b2Vec2( 0, -200 ), baller.physics.GetWorldCenter() );
  })

  input.addBindOnPress( 192, function() {
    window.debug = !window.debug;
  })

  // var bball = new Basketball(
  //   new Box2D.Common.Math.b2Vec2( 0.1, 2 ),
  //   new Box2D.Common.Math.b2Vec2( 10, -10 )
  // )

  requestAnimFrame( update );

}

function update( time ) {

  Canvas.Clear();

  PhysHelpers.Step();

  Sprite.DrawAll();
  if ( window.debug ) PhysHelpers.DebugDraw();

  requestAnimFrame( update );

}

initialize();
},{"./graphics/canvas":1,"./graphics/sprite":2,"./objects/baller":4,"./objects/basketball":5,"./physics/helper":6,"./utils/input":8}],4:[function(require,module,exports){
var PhysHelpers = require('../physics/helper');
var Sprite = require('../graphics/sprite');

function Baller( pos ) {

  var fixdef = PhysHelpers.BoxFixtureDef( 2.3, 7.4 );
  var body = this.physics = PhysHelpers.DynamicBodyFromFixtureDef( fixdef, pos );
  this.physics.SetUserData( this );

  this.sprite = new Sprite( "static/images/baller.png", {
    getPos : function() { 
      return body.GetPosition();
    },
    getAng : function() { return body.GetAngle() },
  });
  this.sprite.width = 75;
  this.sprite.height = 237.5;
  
}

module.exports = Baller;
},{"../graphics/sprite":2,"../physics/helper":6}],5:[function(require,module,exports){
var PhysHelpers = require('../physics/helper');
var Sprite = require('../graphics/sprite');

function Basketball( pos, velocity ) {

  var radius = 0.5;

  var fixdef = PhysHelpers.CircleFixtureDef( radius );
  var body = this.physics = PhysHelpers.DynamicBodyFromFixtureDef( fixdef, pos );
  this.physics.SetUserData( this );
  this.physics.ApplyImpulse( velocity, this.physics.GetWorldCenter() );

  this.physics.onPreSolve = function( other, contact, impulse ) {
    if ( !other ) return;

    if ( other.constructor.name === "Baller" ) {
      contact.SetEnabled( false );
    }
  }

  console.log( this.physics.GetWorldCenter() );

  this.sprite = new Sprite( "static/images/bball.png", {
    getPos : function() { 
      return body.GetPosition();
    },
    getAng : function() { return body.GetAngle() },
  });
  
}

module.exports = Basketball;
},{"../graphics/sprite":2,"../physics/helper":6}],6:[function(require,module,exports){
var Canvas = require('../graphics/canvas');
var Err = require('../utils/error');

var bodyDefTypes = {
  "static" : Box2D.Dynamics.b2Body.b2_staticBody,
  "dynamic" : Box2D.Dynamics.b2Body.b2_dynamicBody,
}

var currentBodyDef = null;
var currentWorld = null;

function initializeDebugDrawForWorld( world ) {

  var ctx = Canvas.GetMainContext();
  if ( ctx === null ) return Err( "ERR_DEBUGDRAW_NORENDERCTX" );

  var debugDraw = new Box2D.Dynamics.b2DebugDraw();
  debugDraw.SetSprite( ctx );
  debugDraw.SetDrawScale( 32 );
  debugDraw.SetFillAlpha( 0.3 );
  debugDraw.SetLineThickness( 1.0 );
  debugDraw.SetFlags( Box2D.Dynamics.b2DebugDraw.e_shapeBit );

  world.SetDebugDraw( debugDraw );

}

function initializeCollisionListeners( world ) {

  var listener = new Box2D.Dynamics.b2ContactListener;

  var onContact = function( contactType, contact, impulse ) {
  
    if ( contact.IsTouching() ) {
      contactType = "on" + contactType;
      if ( contact.GetFixtureA().GetBody()[contactType] ) contact.GetFixtureA().GetBody()[contactType]( contact.GetFixtureB().GetBody().GetUserData(), contact, impulse );
      if ( contact.GetFixtureB().GetBody()[contactType] ) contact.GetFixtureB().GetBody()[contactType]( contact.GetFixtureA().GetBody().GetUserData(), contact, impulse );
    }

  }

  listener.BeginContact = onContact.bind( null, "BeginContact" );
  listener.EndContact = onContact.bind( null, "EndContact" );
  listener.PreSolve = onContact.bind( null, "PreSolve" );
  listener.PostSolve = onContact.bind( null, "PostSolve" );

  world.SetContactListener( listener );

}

function createWorld() {

  var gravity = new Box2D.Common.Math.b2Vec2( 0, 30 );
  var world = new Box2D.Dynamics.b2World( gravity, true );

  currentWorld = world;
  initializeDebugDrawForWorld( world );
  initializeCollisionListeners( world );
  return world;

}

function stepWorld() {

  currentWorld.Step( 1/60, 10, 7 );
  currentWorld.ClearForces();

}

function debugDrawWorld() {

  currentWorld.DrawDebugData();

}

function getOrCreateCurrentBodyDef() {

  return currentBodyDef || new Box2D.Dynamics.b2BodyDef;

}

function getBodyDef( type ) {

  var bodyDef = getOrCreateCurrentBodyDef();
  var type = bodyDefTypes[type];
  bodyDef.type = type !== undefined ? type : Box2D.Dynamics.b2Body.b2_dynamicBody;
  return bodyDef;

}

function createCircleFixtureDef( radius ) {

  var fixDef = new Box2D.Dynamics.b2FixtureDef;
  
  fixDef.density = 1.0;
  fixDef.friction = 0.5;
  fixDef.restitution = 0.9;

  fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape( radius );

  return fixDef;

}

function createBoxFixtureDef( width, height ) {

  var fixDef = new Box2D.Dynamics.b2FixtureDef;

  fixDef.density = 1.0;
  fixDef.friction = 0.5;
  fixDef.restitution = 0.2;

  fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
  fixDef.shape.SetAsBox( width/2, height/2 );

  return fixDef;

}

function createBodyWithFixture( bodyDef, fixDef ) {

  var body = currentWorld.CreateBody( bodyDef );
  body.CreateFixture( fixDef );
  return body;

}

function createDynamicBodyFromFixdef( fixDef, position ) {

  var bodyDef = getBodyDef( "dynamic" );
  bodyDef.position = position;

  return createBodyWithFixture( bodyDef, fixDef );

}

function createStaticBodyFromFixdef( fixDef, position ) {

  var bodyDef = getBodyDef( "static" );
  bodyDef.position = position;

  return createBodyWithFixture( bodyDef, fixDef );

}



module.exports = {
  CreateWorld : createWorld,
  Step: stepWorld,
  DebugDraw: debugDrawWorld,

  CircleFixtureDef : createCircleFixtureDef,
  BoxFixtureDef : createBoxFixtureDef,

  DynamicBodyFromFixtureDef : createDynamicBodyFromFixdef,
  StaticBodyFromFixtureDef : createStaticBodyFromFixdef,
}
},{"../graphics/canvas":1,"../utils/error":7}],7:[function(require,module,exports){
var errors = {

  "ERR_DEBUGDRAW_NORENDERCTX" : "Attempted to initialize debugDraw for physics world before a render context was available.",

  "ERR_NOERROR" : "An unknown error occurred."

}

function outputError( error ) {

  var errtext = errors[error];
  if ( errtext === undefined ) {
    errtext = errors["ERR_NOERROR"];
  }

  console.error( error, errtext );

}

module.exports = outputError;
},{}],8:[function(require,module,exports){

/******************************************************************************
                            InputManager
******************************************************************************/
function InputManager( w ) {

  // set the initial state of the input manager hashes
  this.keyspressed = {};
  this.bindsOnPress = {};
  this.bindsOnRelease = {};

  // add event listeners to our window's incoming input
  w.addEventListener( "keydown", this.pressKey.bind( this ), false );
  w.addEventListener( "keyup", this.releaseKey.bind( this ), false );

}

InputManager.prototype.pressKey = function( key ) {

  // set the key state to pressed
  key = key.keyCode;
  this.keyspressed[key] = true;

  // if there's binds for that key, call them
  if ( this.bindsOnPress[key] ) this.bindsOnPress[key].forEach( function( bind ) {
    bind.call( null, this );
  } );

}

InputManager.prototype.releaseKey = function( key ) {
  
  // set the key state to not pressed
  key = key.keyCode;
  delete this.keyspressed[key];

  // if there's binds for releasing that key, call them
  if ( this.bindsOnRelease[key] ) this.bindsOnRelease[key].forEach( function( bind ) {
    bind.call( null, this );
  } );

}

InputManager.prototype.addBindOnPress = function( key, bind ) {
  // push the bind function onto the hash's array
  this.bindsOnPress[key] ? this.bindsOnPress[key].push( bind ) : this.bindsOnPress[key] = [bind];
}

InputManager.prototype.addBindOnRelease = function( key, bind ) {
  // push the bind function onto the hash's array
  this.bindsOnRelease[key] ? this.bindsOnRelease[key].push( bind ) : this.bindsOnRelease[key] = [bind];
}

InputManager.prototype.clearBinds = function() {

  // reset the bind hashes to empty
  this.bindsOnPress = {};
  this.bindsOnRelease = {};
  
}

InputManager.prototype.isKeyDown = function( key, bind ) {
  return !!this.keyspressed[key];
}

module.exports = InputManager;

},{}]},{},[3]);

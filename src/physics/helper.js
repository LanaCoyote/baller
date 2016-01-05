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
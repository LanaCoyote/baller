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
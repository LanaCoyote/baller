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
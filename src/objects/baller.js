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
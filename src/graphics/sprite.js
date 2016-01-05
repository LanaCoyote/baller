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
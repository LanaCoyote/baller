
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

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
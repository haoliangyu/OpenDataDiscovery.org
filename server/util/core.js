const fs = require('fs');

exports.existSync = function(file) {
  try {
    if (fs.statSync(file)) {
      return true;
    }
  } catch(ex) {
    return false;
  }
};

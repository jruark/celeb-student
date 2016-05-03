const r = require('rethinkdb');

var connect = function () {
  return r.connect({
    host: 'localhost', port: 28015, db: "celeb"
  });
}

exports.connect = connect;

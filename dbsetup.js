const r = require("rethinkdb");
const dbname = "celeb";
r.connect({
  host: 'localhost', port: 28015
}, function(err, conn) {
  if(err) throw err;
  console.log("Creating database.");
  r.dbCreate(dbname).run(conn)
  .then(function(res) {
    console.log("Created database.");
    console.log("Creating Messages");
    r.db(dbname).tableCreate("Messages").run(conn);
  })
  .then(function(res) {
    console.log("Creating Announcements");
    r.db(dbname).tableCreate("Announcements").run(conn);
  })
  .then(function(res) {
    console.log("Creating Images");
    r.db(dbname).tableCreate("Images").run(conn);
  })
  .then(function(res) {
    process.exit(0);
  });
});

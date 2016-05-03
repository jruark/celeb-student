/* eslint no-console: 0 */

const express = require("express");
const path = require("path");
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./webpack.config.js');
const bodyParser = require("body-parser");
const message = require('./server/message.js');
const image = require('./server/image.js');

const isDeveloping = (process.env.NODE_ENV || "").trim() !== "production";
const port = isDeveloping ? 3000 : process.env.PORT;
const app = express();

const multer = require('multer'); // v1.0.5
var upload = multer(
  {
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'public', 'images'));
      },
      filename: function(req, file, cb) {
        var ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
      }
    }),
    limits: { fieldSize: 6000000, files: 1 }
  }
); // for parsing multipart/form-data

console.log("process.env.NODE_ENV=[" + process.env.NODE_ENV + "]");
console.log("isDeveloping=" + isDeveloping);

app.use(bodyParser.urlencoded({extended:false}));

if( isDeveloping) {
  console.log("Development mode");
  const compiler = webpack(config);
  const middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'app',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
  app.use(express.static(__dirname + '/public'));
  app.get('*', function response(req,res) {
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
    res.end();
  });
}
else {
  app.use(express.static(__dirname + '/dist'));
  app.use(express.static(__dirname + '/public'));
  app.get('*', function response(req, res) {
    res.sendFile(path.join(__dirname, "dist/index.html"));
  });
}

app.post("/kiosk/message", function(req,res) {
  var msg = req.body.message || "";
  msg = msg.trim();
  if(msg.length==0 || msg.length>140) {
    res.send("OK");
    res.end();
    return;
  }

  message.submit(req, res, msg).then(function() {
      res.send("OK");
      res.end();
  });
});

app.post("/kiosk/image", upload.single("image"), function(req,res) {
  if(req.file) {
    image.submit(req, res, req.file).then(function() {
      console.log("Got file");
      res.send("OK");
      res.end();
    }).catch(function(reason) {
      console.log("Failed to get image: " + reason);
      res.send("NOTOK");
      res.end();
    });
  }
  else {
    console.log("no file!");
    res.send("NOT OK");
  }
});

app.listen(port, function onStart(err) {
  if(err) {
    console.log(err);
  }
	console.info("Server running on port " + port + " public path " + config.output.publicPath);
});

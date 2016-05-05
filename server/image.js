const r = require('rethinkdb');
const db = require('./db.js');
const path = require('path');
const gm = require('gm');

var submitImage = function (req, res, file) {
    return new Promise(function (resolve, reject) {
        // check image size and reject if necessary
        if (file.size > 6000000) {
            reject("BIG");
            return;
        }

        console.log("File info: " + JSON.stringify(file));

        // create image record pointing to file name
        var img = {
            filename: file.filename,
            originalname: file.originalname,
            size: file.size,
            date: new Date(),
            status: 0,
            ip: req.ip,
            host: req.hostname
        };
        db.connect().then(function (conn) {
            r.table("Images").insert(img).run(conn)
                .then(function (dbres) {
                    //TODO: Check for error
                    console.log("Inserted image [" + file.filename + "] at " + img.date);
                    // strip profile info from file
                    var imgpath = path.join(__dirname, "..", "public", "images", file.filename);
                    gm(imgpath)
                        .noProfile()
                        .write(imgpath, function (err) {
                            if (!err) {
                                resolve("OK");
                            }
                            else {
                                reject(err);
                            }
                        });
                });
        });
    });
}

var changeStatus = function (imgid, status) {
    return new Promise(function (resolve, reject) {
        db.connect().then(function (conn) {
            r.table("Images").get(imgid).update({ status: status })
                .run(conn)
                .then(function (dbres) {
                    console.log("Changed image status [" + imgid + "] to " + status);
                    resolve("OK");
                });
        });
    });
}

var approveImage = function (imgid) {
    return changeStatus(imgid, 1);
}

var rejectImage = function (imgid) {
    return changeStatus(imgid, 2);
}

exports.submit = submitImage;
exports.approve = approveImage;
exports.reject = rejectImage;

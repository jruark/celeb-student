const r = require('rethinkdb');
const db = require('./db.js');

var submitMessage = function(req, res, msgtxt) {
    return new Promise(function(resolve, reject) {
        var msg = {
            msg: msgtxt,
            date: new Date(),
            status: 0,
            ip: req.ip,
            host: req.hostname
        };
        db.connect().then(function(conn) {
        r.table("Messages").insert(msg).run(conn)
            .then(function(dbres) {
                console.log("Inserted message [" + msgtxt + "] at " + msg.date);
                resolve("OK");
            })
            .error(function(err) {
                console.error("Unable to submit message [" + msgtxt + "]. Error: " + err);
                reject(err);
            });
        });
    });
}

var changeStatus = function(msgid, status) {
    return new Promise(function(resolve, reject) {
        db.connect().then(function(conn) {
            r.table("Messages").get(msgid).update({status: status})
                .run(conn)
                .then(function(dbres) {
                    console.log("Changed message status [" + msgid + "] to " + status);
                    resolve("OK"); 
                })
                .error(function(err) {
                    console.error("Unable to update status of message [" + msgid + "]. Error: " + err);
                    reject(err);
                });
        });
    });
}

var approveMessage = function(msgid) {
    return changeStatus(msgid, 1);
}

var rejectMessage = function(msgid) {
    return changeStatus(msgid, 2);
}

exports.submit = submitMessage;
exports.approve = approveMessage;
exports.reject = rejectMessage;

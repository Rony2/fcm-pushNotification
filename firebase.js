var schedule = require('node-schedule');
var FCM = require('fcm-push');
var serverKey = 'AAAAKPfNuyo:APA91bGy-Jh25WBq-neul4VPGItyJrHCkvhU_csrs7g57bT5QubgvSRHE-Plfcb5s4A-BZ2hU4UGQ7IUAX_toRWZUk-GEyRkhR-gUosDssIptPeNbS9M5Y7ut9e86uDFaKXH7LVrxMe8';
var fcm = new FCM(serverKey);

var admin = require("firebase-admin");

var serviceAccount = require("./config.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://spotify-coda.firebaseio.com"
});


function scheduleJobs() {
    var db = admin.firestore();
    var ref = db.collection('fcTokens');

    ref.get().then(snapshot => {
        snapshot.forEach(doc => {
            console.log(doc.id, '=>', doc.data());
            var data = doc.data();
            var message = {
                to: data.token,
                notification: {
                    title: 'Water Drink Reminder',
                    body: 'Time to get energise your body with a cup of water',
                    click_action: 'https://google.com'
                }
            };
            var date = new Date();
            date.setTime(new Date().getTime() + data.reminderTime * 60 * 60 * 1000);
            console.log(date, new Date());
            var j = schedule.scheduleJob(date, function () {
                fcm.send(message, function (err, resp) {
                    if (err) {
                        console.log("Something has gone wrong!");
                        //response.send(err);
                    } else {
                        console.log("Successfully sent with response: ", resp);
                    }
                });
            })
        });
    })
}

module.exports = {
    scheduleJobs
}
'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});
const APP_NAME = 'ICIC-RTM';

const padToTwo = function(num) {
  if (num<=9) return '0' + num;
  return num;
}

const measureKeyToDate = function(key) {
  // example 2019-05-02T11:22:00Z
  const dateString = '20' + key.substr(0,2) + '-' + key.substr(2,2) + '-' + key.substr(4,2) + 'T' + key.substr(6,2) + ':' + key.substr(8,2) + ':00Z';
  return new Date(dateString);
}

const updateNextMeasure = function() {
  return admin.database()
  .ref('/tank_measures/measures')
  .orderByKey()
  .limitToLast(1)
  .once('value').then((snapshot) => {
    snapshot.forEach((childSnap) => {
      const k = childSnap.key;
      // example 1905021122
      if(k.length !== 10 || isNaN(Number(k))) {
        return;
      }

      const measureInterval = 5; // In minutes
      
      var lastDate = measureKeyToDate(k);
      var newDate = new Date(lastDate.setMinutes(lastDate.getMinutes() + measureInterval));
      // eslint-disable-next-line no-implicit-coercion
      const nextMeasureValue = (newDate.getFullYear() % 100) + '' + padToTwo(newDate.getMonth() + 1) + '' + padToTwo(newDate.getDate()) + '' + padToTwo(newDate.getHours()) + '' + padToTwo(newDate.getMinutes());

      admin.database().ref('/tank_measures/next-measure').set(Number(nextMeasureValue));
    });
    return;
  });
}

// Used this function to update all measurement with data, time and year. 
const setAllMeasureDateParts = function() {
  return admin.database()
  .ref('/tank_measures/measures')
  .orderByKey()
  // .limitToFirst(1000)
  //worked with 3700 meausrements at once. maybe more that this will give out of memory error. 
  .once('value').then((snapshot) => {
    let promises = [];
    snapshot.forEach((childSnap) => {
      const k = childSnap.key;
      if(k.length !== 10 || isNaN(Number(k))) {
        return;
      }
      
      var measureDate = measureKeyToDate(k);
      admin.database().ref('/tank_measures/measures/' + k + '/time').set(padToTwo(measureDate.getHours()) + ':' + padToTwo(measureDate.getMinutes()));
      admin.database().ref('/tank_measures/measures/' + k + '/date').set(padToTwo(measureDate.getMonth() + 1) + ':' + padToTwo(measureDate.getDate()));
      admin.database().ref('/tank_measures/measures/' + k + '/year').set(measureDate.getFullYear());
    });
    return;
  });
}

const incrementMeasureCounter = function(increment) {
  const countRef = admin.database().ref('/tank_measures/measure_count');
  if (isNaN(Number(increment))) {
    return null;
  }

  return countRef.transaction((current) => {
    return (current || 0) + increment;
  });
}

const checkLevelAlerts = function(measure) {
  const alertsRef = admin.database().ref('/data/level-alerts');
  let tanks = {};
  let alerts = {};
  return alertsRef
  .orderByKey()
  .once('value').then((snapshot) => {
    snapshot.forEach((childSnap) => {
      alerts[childSnap.key] = childSnap.val();
    });
    return snapshot;
  }).then((s) => {
    return  admin.database().ref('/data/tanks').orderByKey().once('value')
  }).then((snapshot) => {
    snapshot.forEach((childSnap) => {
      tanks[childSnap.key] = childSnap.val();
    });
    return snapshot;
  }).then((s) => {
    let promises = [];
    for (let key in alerts) {
      let alert = alerts[key];
      alert.id = key;
      if(!tanks[alert.tankId]) continue;
      const tank = tanks[alert.tankId];
      const tankLevel = measure[tank.mcode + '-L'];
      
      if(alert.type === 'lower' && alert.level >= tankLevel) {
        promises.push(sendLevelAlert(alert, tank));
      }
      if(alert.type === 'higher' && alert.level <= tankLevel) {
        promises.push(sendLevelAlert(alert, tank));
      }
    }

    return Promise.all(promises);
  });
}

const sendLevelAlert = function(levelAlert, tank) {
  //This will send an alert only once a day
  //So it is checking this alert is already sent today
  const date = new Date();
  const dateKey = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
  return admin.database().ref('/data/level-alert-history/' + dateKey + '/' + levelAlert.id)
  .once('value')
  .then((snapshot) =>  {
    if(snapshot.exists()) return null;
    //saving hostory for alert and does do the required operations (email, push)
    sendLevelAlertEmail(levelAlert, tank);
    return saveLevelAlertHistory(levelAlert, tank);
  });
}

const saveLevelAlertHistory = function(levelAlert, tank) {
  const date = new Date();
  const dateKey = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
  
  var historyData = {
    levelId: levelAlert.id,
    date: dateKey,
    tankName: tank.name,
    tankId: levelAlert.tankId,
    emails: levelAlert.emails,
    alertId: levelAlert.id
  };

  const historyRef = admin.database().ref('/data/level-alert-history/' + dateKey + '/' + levelAlert.id);

  return historyRef.set(historyData);
}

async function sendLevelAlertEmail(levelAlert, tank) {
  const mailOptions = {
    from: `${APP_NAME} <noreply@montorkh-rtm.com>`,
    to: levelAlert.emails,
  };

  mailOptions.subject = `Шатахууны түвшний дохиолол`;
  mailOptions.html = `Автомат дохиолол
  <br>
  ${tank.name || ''} савны шатахууны түвшин ${levelAlert.level} мм ээс ${levelAlert.type === 'lower' ? 'доош' : 'дээш'} болсон байна! 
  <br><br>
  <strong>Дохиоллын нэмэлт мэдээлэл:</strong><br>
  ${levelAlert.description}
  <br><br>
  Дэлгэрэнгүй мэдээлэл харах эсвэл энэхүү дохиоллын мэдээллийг өөрчлөхийг хүсвэл доорх линкээр нэвтэрнэ үү.<br>
  Системд нэвтрэх линк: https://montorkh-rtm-2.web.app
  <br><br>
  -------------------------------------------------------------<br>
  Энэхүү дохиолол нь RTM системээс автоматаар илгээгдсэн болно.`;
  await mailTransport.sendMail(mailOptions);
  console.log('Level alert email to:', levelAlert.emails);
  return null;
}

// Listens for new measures added to /tank_measures/measures/ and update
// next_measure date
  exports.updateNextMeasureOnCreate = functions.database.ref('/tank_measures/measures/{pushId}')
  .onCreate((snapshot, context) => {
    incrementMeasureCounter(1);

    const key = snapshot.key;
    const measureDate = measureKeyToDate(key);

    let promises = [];
    promises.push(snapshot.ref.child('time').set(padToTwo(measureDate.getHours()) + ':' + padToTwo(measureDate.getMinutes())));
    promises.push(snapshot.ref.child('date').set(padToTwo(measureDate.getMonth() + 1) + ':' + padToTwo(measureDate.getDate())));
    promises.push(snapshot.ref.child('year').set(measureDate.getFullYear()));
    promises.push(updateNextMeasure());
    promises.push(checkLevelAlerts(snapshot.val()));
    return Promise.all(promises);
  });

// // Listens for measures deletion from /tank_measures/measures/ and update
// // next_measure date
  exports.updateNextMeasureOnDelete = functions.database.ref('/tank_measures/measures/{pushId}')
  .onDelete((snapshot, context) => {
    incrementMeasureCounter(-1);
    return updateNextMeasure();
  });


  exports.countMeasures = functions.database.ref('/tank_measures/measure_count').onDelete((snap) => {
    const counterRef = snap.ref;
    const collectionRef = admin.database().ref('/tank_measures/measures');
  
    return collectionRef.once('value').then((snapshot) => {
      return counterRef.set(snapshot.numChildren());
    });
  });
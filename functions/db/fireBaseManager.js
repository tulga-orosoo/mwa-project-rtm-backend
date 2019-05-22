const firebase = require('firebase-admin')
const env = require('dotenv')

env.config({path:'./.env'})
//const SERVICE_ACCOUNT = require(process.env.ServiceAccount)
const DATABASE_URL = "https://montorkh-rtm.firebaseio.com"

var firebaseConfig = {
  //credential: firebase.credential.cert(SERVICE_ACCOUNT),
  databaseURL: DATABASE_URL
};

try {

  firebase.initializeApp(firebaseConfig)
  console.log("Database Status: Conected")
}
catch (exception) {

  console.log("Database Status: Not Conected")
}

const auth = firebase.auth()
const db = firebase.database()

module.exports = { db, auth }

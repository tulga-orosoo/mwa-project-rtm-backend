const rTDB = require('../fireBaseManager')

const { db, auth } = rTDB
const userCollection = db.ref('/data/users')

//Create User
const createUser = (user, disabled = false) => {

  const userObject = {
    email: user.getEmail(),
    emailVerified: false,
    phoneNumber: user.getPhoneNumber(),
    password: user.getPassword(),
    displayName: `${user.getFirstName()} ${user.getLastName()}`,
    photoURL: `${user.getPhotoURL()}`,
    disabled: disabled
  }

  return auth.createUser(userObject)
    .then(userRecord => {

      const userDBObject = {
        firstName: user.getFirstName(),
        lastName: user.getLastName(),
        email: user.getEmail(),
        phoneNumber: user.getPhoneNumber(),
        photoURL: user.getPhotoURL(),
        tanks: user.getTanks(),
        disabled: disabled
      }

      userCollection.child(`/${userRecord.uid}`).set(userDBObject)
      return userRecord
    }) 
}

//Update User
const updateUser = (id, user) => {

  const userObject = {
    email: user.getEmail(),
    emailVerified: false,
    phoneNumber: user.getPhoneNumber(),
    password: user.getPassword(),
    displayName: `${user.getFirstName()} ${user.getLastName()}`,
    photoURL: `${user.getPhotoURL()}`,
    disabled: user.disabled
  }

  return auth.updateUser(id, userObject).then(() => {
    const userDBObject = {
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
      email: user.getEmail(),
      phoneNumber: user.getPhoneNumber(),
      photoURL: user.getPhotoURL(),
      tanks: user.getTanks()
    }
    return userCollection.child(`/${id}`).set(userDBObject)
  }
  )
}

//Retrieve User
const getUsers = () => {

  const results = []

  return userCollection.once('value')
    .then(docs => {
      docs.forEach(doc => {
        const data = doc.val()
        data.uid = doc.key
        results.push(data)
      })
      return results
    })
}

//Delete User
const deleteUser = (id) => {
  return auth.deleteUser(`${id}`)
    .then(() => {
      return userCollection.child(`/${id}`).remove()
    })
}

//Get single user
const getUser = (id) => {
  return new Promise((res, rej) => {
    userCollection.child(`/${id}`).once('value', (snapShot, err) => {
      const data = snapShot.val()
      data.uid = snapShot.key
      res(data)
    })
  })
}

module.exports = { createUser, getUsers, updateUser, deleteUser, getUser }
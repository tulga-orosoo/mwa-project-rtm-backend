const express = require('express')
const userOperations = require('../db/operations/userOperations')
const User = require('../db/models/user')

const jsonParser = express.json()
const router = express.Router()

router.all('/',(req,res,next)=>{

    next()
})

router.get('/', (req, res, next) => {
    userOperations.getUsers().then(users => {
        res.json(users)
        return next()
    }).catch()
})

router.get('/user', (req, res, next) => {
    const { id } = req.query
    userOperations.getUser(id).then(user => {
        res.json(user)
        return next()
    }).catch()
})

router.post('/user', jsonParser, (req, res, next) => {

    const { firstName, lastName, phoneNumber, photoURL, email, password } = req.body

    const user = new User()
    user.setFirstName(firstName)
    user.setLastName(lastName)
    user.setEmail(email)
    user.setPhoneNumber(phoneNumber)
    user.setPhotoURL(photoURL)
    user.setPassword(password)

    userOperations.createUser(user).then(() => {
        res.json({ status: 'Success', message: 'User has been created' })
        return next()

    }).catch((err) => {
        res.json({ status: 'Error creating new user', message: err })
    })
})

router.put('/user', jsonParser, (req, res, next) => {

    const { firstName, lastName, phoneNumber, photoURL, email, password } = req.body

    const user = new User()
    user.setFirstName(firstName)
    user.setLastName(lastName)
    user.setEmail(email)
    user.setPhoneNumber(phoneNumber)
    user.setPhotoURL(photoURL)
    user.setPassword(password)

    const { id } = req.query

    userOperations.updateUser(id, user).then(() => {
        res.json({ status: 'Success', message: 'User has been updated' })
        return next()

    }).catch((err) => {
        res.json({ status: 'Error while updating user', message: err })
    })
})

router.delete('/user', (req, res, next) => {

    const { id } = req.query

    userOperations.deleteUser(id).then(() => {
        res.json({ status: 'Sucess', message: 'User has been deleted' })
        return next()
    }).catch((err) => {
        res.json({ status: 'Error while deleting user', message: err })
    })
})

module.exports = router
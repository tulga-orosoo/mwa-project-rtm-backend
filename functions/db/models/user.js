
const User = function () {

    this.firstName
    this.lastName
    this.email = null
    this.phoneNumber = null
    this.photoURL = null
    this.tanks = null
    this.password = null
    this.disabled=false

    setFirstName = (firstName) => { this.firstName = firstName }
    setLastName = (lastName) => { this.lastName = lastName }
    setEmail = (email) => { this.email = email }
    setPhoneNumber = (phoneNumber) => { this.phoneNumber = phoneNumber }
    setPassword = (password) => { this.password = password }
    setPhotoURL = (path = null) => {
        this.profilePicturePath = path;
    }
    addTanks = (...tanks) => {
        this.tanks.push.apply(tanks)
    }
    getFirstName = () => this.firstName
    getLastName = () => this.lastName
    getEmail = () => this.email
    getPhoneNumber = () => this.phoneNumber
    getPhotoURL = () => this.profilePicturePath // To be Implemented
    getTanks = () => this.tanks
    getPassword = () => { this.password }

    return {
        setEmail,
        setLastName,
        setPhoneNumber,
        setPhotoURL,
        addTanks,
        setFirstName,
        setPassword,
        getFirstName,
        getLastName,
        getEmail,
        getPhoneNumber,
        getPhotoURL,
        getTanks,
        getPassword
    }
}

// // //Builder class for creating User
// class Builder {

//     user = new User();

//      setFirstName(firstName) {
//         user.firstName = firstName;
//         return this;
//     }

//      setLastName(lastName) {
//         this.user.lastName = lastName;
//         return this;
//     }
//      setEmail(email = null) {
//         this.user.email = email;
//         return this;
//     }
//     // setPassword(password){
//     //     this.user.password=password
//     //     return this
//     // }
//      setPhoneNumber(phoneNumber = null) {
//         this.user.phoneNumber = phoneNumber;
//         return this;
//     }
//      setProfilePicturePath(path = null) {
//         this.user.profilePicturePath = path;
//         return this
//     }
//      addTanks(...tanks) {
//         this.user.tanks.push.apply(tanks)
//         return this;
//     }
//      build() {
//         return user;
//     }

// }

module.exports = User

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

    // //Builder class for creating User
    // Builder = function () {

    //     user = new User();

    //     function setFirstName(firstName) {
    //         user.firstName = firstName;
    //         return this;
    //     }

    //     function setLastName(lastName) {
    //         this.user.lastName = lastName;
    //         return this;
    //     }
    //     function setEmail(email = null) {
    //         this.user.email = email;
    //         return this;
    //     }
    //     // setPassword(password){
    //     //     this.user.password=password
    //     //     return this
    //     // }
    //     function setPhoneNumber(phoneNumber = null) {
    //         this.user.phoneNumber = phoneNumber;
    //         return this;
    //     }
    //     function setProfilePicturePath(path = null) {
    //         this.user.profilePicturePath = path;
    //         return this
    //     }
    //     function addTanks(...tanks) {
    //         this.user.tanks.push.apply(tanks)
    //         return this;
    //     }
    //     function build() {
    //         return user;
    //     }

    //     return {setFirstName,build}
    // }

    // return { Builder, getFirstName }

}

module.exports = User
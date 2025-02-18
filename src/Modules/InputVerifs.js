
var Functions = {
    "password": function (value) {
        // At least 8 characters, one uppercase, one lowercase, one number, and one special character
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        var result = regex.test(value) || "Your password must have atleast 8 characters, one uppercase, one lowercase, one number"
        return result;
    },

    "confirm-password": function (value) {
        let passwordinput = document.getElementById("password")
        let result = passwordinput.value == value
        return result || "The password don't match";
    },

    "birthdate": function (value) {

        const date = new Date(value);
        const today = new Date();
        return !isNaN(date.getTime()) || "Insert a valid birthdate";
    },

    "postalcode": function (value) {
        // Allows alphanumeric postal codes with an optional space
        const postalCodeRegex = /^[A-Z0-9\s\-]{3,10}$/;
    
        
        return postalCodeRegex.test(value) || "The postal code is invalid";
    },

    "email": function (value) {

        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(value) || "Write a valid email";
    },

    "username": function (value) {
     
        const regex = /^[A-Za-z\d]{3,20}$/;
        return regex.test(value) || "Your username must have between 3-20 characters";
    },

    "phone": function (value) {
    
        const IsValid = value.length >= 4 && value.length <= 10
        return IsValid || "Your phone number must have atleast 4 digits";
    },

    "default": function (value) {
    
        return typeof value === "string" && value.trim() != "" || "This field is required";
    },
}


export default Functions

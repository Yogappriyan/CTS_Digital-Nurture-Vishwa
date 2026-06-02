// Welcome Message
console.log("Welcome to Community Portal");

// Page Loaded
window.onload = function () {
    alert("Page Loaded Successfully");
};

// Registration Button
function registerUser() {
    alert("Registration Successful");
}

// Phone Validation
function validatePhone() {

    let phone =
    document.getElementById("phone").value;

    if (phone.length != 10) {
        alert("Enter Valid Phone Number");
    }
}

// Event Fee Display
function showFee() {

    let event =
    document.getElementById("eventType").value;

    let fee =
    document.getElementById("fee");

    if (event == "Music Festival") {
        fee.innerHTML = "Fee : ₹500";
    }
    else if (event == "Sports Meet") {
        fee.innerHTML = "Fee : ₹300";
    }
    else {
        fee.innerHTML = "Fee : ₹200";
    }
}

// Character Counter
function countCharacters() {

    let text =
    document.getElementById("feedback").value;

    document.getElementById("count").innerHTML =
    text.length;
}

// Save Event Preference
function savePreference() {

    let event =
    document.getElementById("eventType").value;

    localStorage.setItem("event", event);
}

// Find Location
function findLocation() {

    navigator.geolocation.getCurrentPosition(

        function(position){

            document.getElementById("location")
            .innerHTML =
            "Latitude : " +
            position.coords.latitude +
            "<br>Longitude : " +
            position.coords.longitude;

        }

    );
}
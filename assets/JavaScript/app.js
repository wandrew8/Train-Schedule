// Steps to complete:

// 1. Create Firebase link
// 2. Create initial train data in database
// 3. Create button for adding new trains - then update the html + update the database
// 4. Create a way to retrieve trains from the trainlist.
// 5. Create a way to calculate the time way. Using difference between start and current time.
//    Then take the difference and modulus by frequency. (This step can be completed in either 3 or 4)

// Initialize Firebase by providing the following information from the firebase website upon setting up a web application
var config = {
  apiKey: "AIzaSyCcPFcbAjIsgXGQwE-A3AcOXkeD40qypE8",
  authDomain: "train-times-93583.firebaseapp.com",
  databaseURL: "https://train-times-93583.firebaseio.com",
  storageBucket: "train-times-93583.appspot.com"
};

firebase.initializeApp(config);

//A variable which connects to the firebase database
var trainData = firebase.database();

// Populate Firebase Database with initial data (in this case, I did this via Firebase GUI)
// Button for adding trains when submit button is clicked
$("#add-train-btn").on("click", function(event) {
  // Prevent the default form submit behavior
  event.preventDefault();

  // Grabs user input
  //This grabs the input value of the first input field which is the train's name and trims any white space before and after the input
  var trainName = $("#train-name-input")
    .val()
    .trim();
   //This grabs the input value of the second input field which is the train's destination and trims any white space before and after the input
  var destination = $("#destination-input")
    .val()
    .trim();
  //This grabs the input value of the third input field which is the train's first departure time and trims any white space before and after the input
  var firstTrain = $("#first-train-input")
    .val()
    .trim();
  //This grabs the input value of the fourth input field which is the train's frequency and trims any white space before and after the input
  var frequency = $("#frequency-input")
    .val()
    .trim();

  // Creates local "temporary" object for holding train data and includes four key-value pairs using the input information
  var newTrain = {
    name: trainName,
    destination: destination,
    firstTrain: firstTrain,
    frequency: frequency
  };

  // This uploads the newly created object containing four key-value pairs and pushes it to the firebase database
  trainData.ref().push(newTrain);

  // This logs the values of the newTrain object through the use of dot notation 

  //This logs the trainName variable from the newTrain object associated with the name key
  console.log(newTrain.name);
  //This logs the destination variable from the newTrain object associated with the destination key
  console.log(newTrain.destination);
  //This logs the firstTrain variable from the newTrain object associated with the firstTrain key
  console.log(newTrain.firstTrain);
  //This logs the frequency variable from the newTrain object associated with the frequency key
  console.log(newTrain.frequency);

  // Upon submit an alert pops up with the message below
  alert("Train successfully added");

  // After all the input values are saved in the newTrain object the input fields are emptied so the user doesn't need to delete manually
  $("#train-name-input").val("");
  $("#destination-input").val("");
  $("#first-train-input").val("");
  $("#frequency-input").val("");
});

// 4. Create Firebase event for adding trains to the database and a row in the html when a user adds an entry
trainData.ref().on("child_added", function(childSnapshot, prevChildKey) {
  console.log(childSnapshot.val());

  // Store everything into a variable.
  //This variable holds data from the firebase database associated with the train's name
  var tName = childSnapshot.val().name;
  //This variable holds data from the firebase database associated with the train's destination
  var tDestination = childSnapshot.val().destination;
  //This variable holds data from the firebase database associated with the train's frequency
  var tFrequency = childSnapshot.val().frequency;
  //This variable holds data from the firebase database associated with the time of the first train
  var tFirstTrain = childSnapshot.val().firstTrain;

  //This variable splits the time of the first train into an array containing two substrings, a string before the colon (hours) and a string after the colon (minutes)
  var timeArr = tFirstTrain.split(":");
  //A new variable named trainTime is created that puts the two strings together minus the colon. Using moment.js it creates an hours using the first string in the array and minutes using the second string in the array
  var trainTime = moment()
    .hours(timeArr[0])
    .minutes(timeArr[1]);
  //This new variable pulls the latest time
  var maxMoment = moment.max(moment(), trainTime);
  var tMinutes;
  var tArrival;

  // If the first train is later than the current time, set arrival to the first train time
  if (maxMoment === trainTime) {

    //This sets the format of the arrival time as hour and minutes set to either AM or PM
    tArrival = trainTime.format("hh:mm A");
    //This is the number of minutes until the next train by calculating the difference between the current time and the time of the next train
    tMinutes = trainTime.diff(moment(), "minutes");
  } else {
    // Calculate the minutes until arrival using hardcore math
    // To calculate the minutes till arrival, take the current time in unix subtract the FirstTrain time
    var differenceTimes = moment().diff(trainTime, "minutes");
    // and find the modulus between the difference and the frequency.
    var tRemainder = differenceTimes % tFrequency;
    //This sets the minutes until the next train by 
    tMinutes = tFrequency - tRemainder;
    // To calculate the arrival time, add the tMinutes to the current time
    tArrival = moment()
      .add(tMinutes, "m")
    //Then set the format as follows
      .format("hh:mm A");
  }
  
  console.log("tMinutes:", tMinutes);
  console.log("tArrival:", tArrival);

  // Add each train's data into the table by pulling the table id 'train-table' and all it's children and dynamically appending the row and all its data
  //The table data elements are pulled from the firebase database
  $("#train-table > tbody").append(
    $("<tr>").append(
      $("<td>").text(tName),
      $("<td>").text(tDestination),
      $("<td>").text(tFrequency),
      $("<td>").text(tArrival),
      $("<td>").text(tMinutes)
    )
  );
});

// Assume the following situations.

// (TEST 1)
// First Train of the Day is 3:00 AM
// Assume Train comes every 3 minutes.
// Assume the current time is 3:16 AM....
// What time would the next train be...? ( Let's use our brains first)
// It would be 3:18 -- 2 minutes away

// (TEST 2)
// First Train of the Day is 3:00 AM
// Assume Train comes every 7 minutes.
// Assume the current time is 3:16 AM....
// What time would the next train be...? (Let's use our brains first)
// It would be 3:21 -- 5 minutes away

// ==========================================================

// Solved Mathematically
// Test case 1:
// 16 - 00 = 16
// 16 % 3 = 1 (Modulus is the remainder)
// 3 - 1 = 2 minutes away
// 2 + 3:16 = 3:18

// Solved Mathematically
// Test case 2:
// 16 - 00 = 16
// 16 % 7 = 2 (Modulus is the remainder)
// 7 - 2 = 5 minutes away
// 5 + 3:16 = 3:21

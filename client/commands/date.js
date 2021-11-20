/**
* @syntax 
* @description Shows the current date
*/
var today = new Date();
var month = today.getMonth()+1
if (month < 10) {
  month = "0" + month;
}
var year = today.getFullYear()
if (year < 10) {
  year = "0" + year;
}
var date = today.getDate() + "." + month + "." + year
termAPI.write("The current date is: " + date)
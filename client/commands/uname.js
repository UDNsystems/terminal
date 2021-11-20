/**
 * @syntax 
 * @description Linux's uname command.
 */
var today = new Date();
var mins = today.getMinutes()
if (mins < 10) {
mins = "0" + mins;
}
var secs = today.getSeconds()
if (secs < 10) {
secs = "0" + secs;
}
var time = today.getHours() + ":" + mins + ":" + secs
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

termAPI.write("udn-alpha 0.7.0 WebOS.Machine NightlyBuild " + date + " " + time + " udn64")
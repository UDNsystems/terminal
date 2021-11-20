/**
 * @syntax 
 * @description Gets the current time
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

termAPI.write("The current time is: " + time)
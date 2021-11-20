/**
 * @syntax <username>
 * @description Change your username.
 */
let [username] = termAPI.getArguments(line);
let uduck = "";
if (username !== undefined) uduck = username.trim();
if (uduck === "") return termAPI.write(termAPI.getUsername());
if (uduck === termAPI.getUsername()) return;
termAPI.setUsername(uduck);
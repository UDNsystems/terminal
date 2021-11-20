let [toggle] = termAPI.getArguments(line);

let onOff = toggle === "on" ? "True" : "False";

termAPI.OSComms.setStorageKey('sus_mode', onOff)
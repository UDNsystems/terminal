/**
 * @syntax <lang>
 * @description Changes UDN system's language.
 */
let [lang] = termAPI.getArguments(line);

termAPI.OSComms.setStorageKey("language", lang);

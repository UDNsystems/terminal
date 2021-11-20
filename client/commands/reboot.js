/**
 * @syntax 
 * @description Reboots UDN systems.
 */
if (!isRoot) return termAPI.write('reboot: You need root permissions to run this command.');
termAPI.OSComms.reboot();

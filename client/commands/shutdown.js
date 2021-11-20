/**
 * @syntax 
 * @description Shutdowns UDN
 */
if (!isRoot) return termAPI.write('shutdown: You need root permissions to run this command.')
try {
	termAPI.OSComms.shutdown()
} catch {
	termAPI.write('Unable to shutdown.');
}
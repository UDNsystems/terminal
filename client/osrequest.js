function OSRequest(action, kind, body) {
  function generateMessageID() {
    return Math.floor(Math.random() * 99999999)
  }
  return new Promise(resolve => {
    let msgId = generateMessageID();
    let handle = function(message) {
      console.log(message.data)
      if (message.data.messageId !== msgId) return;
      resolve(message.data.response)
      window.removeEventListener('message', handle);
    }
    window.addEventListener('message', handle);
    top.postMessage({
      request: {
        action,
        kind,
        body
      },
      messageId: msgId,
      origin: 'terminal osreqlib/0.1'
    },'*')
  })
}
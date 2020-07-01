var MailFetcher = (function() {
  function MailFetcher() {
    if (typeof MailFetcher.config === 'undefined') {
      MailFetcher.config = new Config();
    }
  }
  
  function apply_to_query_messages(query, callback) {
    let page_size = MailFetcher.config.threads_page_size;
    let upper_limit = Math.floor(MailFetcher.config.max_threds / page_size) * page_size;
    
    let offset = 0;
    while (true) {
      let threads = GmailApp.search(query, offset, page_size);
      threads.forEach(function (thread) {
        thread.getMessages().forEach(function (message) {
          callback(new FlatMessage(message));
        });
      });
      
      if (threads.length < page_size) {
        return offset + threads.length;
      }
      
      offset += threads.length;
      
      if (offset >= upper_limit) {
        return offset;
      }
    }
    
    return 0;
  }
  
  MailFetcher.prototype = {
    applyToQueryMessages: apply_to_query_messages
  };
  
  Object.defineProperties(MailFetcher.prototype, {
  });
  
  return MailFetcher;
}());
var MailFetcher = (function() {
  function MailFetcher() {
    if (typeof MailFetcher.config === 'undefined') {
      MailFetcher.config = new Config();
    }
  }

  function apply_to_query_messages(query, callback) {
    let page_size = MailFetcher.config.threads_page_size;
    let upper_limit = Math.floor(MailFetcher.config.max_threads / page_size) * page_size;

    let offset = 0;
    let message_count = 0;
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

    return offset;
  }

  function apply_to_query_message_ids(query, callback) {
    let page_size = MailFetcher.config.threads_page_size;
    let upper_limit = Math.floor(MailFetcher.config.max_threds / page_size) * page_size;

    let total_processed = 0;
    let page_token = undefined;
    do {
      let threads = Gmail.Users.Messages.list('me', {
        includeSpamTrash: true,
        maxResults: page_size,
        pageToken: page_token,
        q: query,
      });

      page_token = threads.nextPageToken;
      if (threads && threads.messages) {
        threads.messages.forEach(message => callback(new FlatMessage(message)));
        total_processed += threads.messages.length;
      }

      if (total_processed >= upper_limit) {
        page_token = null;
      }
    } while (page_token);

    return total_processed;
  }

  MailFetcher.prototype = {
    applyToQueryMessages: apply_to_query_messages,
    applyToQueryMessageIds: apply_to_query_message_ids
  };

  Object.defineProperties(MailFetcher.prototype, {
  });

  return MailFetcher;
}());

var TemporalFilter = (function() {
  let columns = {
    label: 1,
    query: 2,
    // intentionally_left_blank = 3,
    trash: 4,
    archive: 5,
    read: 6,
  };

  function TemporalFilter(row) {
    if (typeof TemporalFilter.config === 'undefined') {
      TemporalFilter.config = new Config();
    }

    if (typeof TemporalFilter.mail_fetcher === 'undefined') {
      TemporalFilter.mail_fetcher = new MailFetcher();
    }

    if (typeof TemporalFilter.stats === 'undefined') {
      TemporalFilter.stats = new Stats();
    }

    this._row = row;
  }

  function n_days_ago(n) {
    return new Date(new Date().setDate(new Date().getDate() - n));
  }

  function query_append_before_caluse(query, n) {
    let date = Utilities.formatDate(n_days_ago(n), "UTC", "yyyy/MM/dd");
    return `${query} before:${date}`;
  }

  function generate_query() {
    let query_components = [];

    if (this.label) {
      let labels = this.label.split(/,\s*/).join(" ");
      query_components.push(`label:{${labels}}`);
    }

    if (this.query) {
      query_components.push(this.query);
    }

    return query_components.join(" ");
  }

  function filter_mail() {
    let query = this.generateQuery();
    let total_messages_processed = 0;

    if (this.trash) {
      let start = new Date();
      let trash_query = query_append_before_caluse(query, this.trash);
      trash_query = `${trash_query} AND NOT in:trash`;
      total_messages_processed += TemporalFilter.mail_fetcher.applyToQueryMessages(trash_query, message => message.trash());
      // TemporalFilter.stats.log(start, new Date(), 'temporal_filter:filter_mail:trash', messages_processed);
    }

    if (this.archive) {
      let start = new Date();
      let archive_query = query_append_before_caluse(query, this.archive);
      archive_query = `${archive_query} AND in:inbox`;
      total_messages_processed += TemporalFilter.mail_fetcher.applyToQueryMessages(archive_query, message => message.archive());
      // TemporalFilter.stats.log(start, new Date(), 'temporal_filter:filter_mail:archive', messages_processed);
    }

    if (this.read) {
      let start = new Date();
      let read_query = query_append_before_caluse(query, this.read);
      read_query = `${read_query} AND is:unread`;
      total_messages_processed += TemporalFilter.mail_fetcher.applyToQueryMessages(read_query, message => message.markRead());
      // TemporalFilter.stats.log(start, new Date(), 'temporal_filter:filter_mail:read', messages_processed);
    }

    return total_messages_processed;
  }

  TemporalFilter.prototype = {
    generateQuery: generate_query,
    filterMail: filter_mail,
  };

  Object.entries(columns).forEach(function ([key, val]) {
    Object.defineProperty(TemporalFilter.prototype, key, {
      get: function() {
        return this._row[val - 1];
      },
    });
  });

  Object.defineProperties(TemporalFilter.prototype, {
  });

  return TemporalFilter;
}());

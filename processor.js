var Processor = (function () {
  function Processor(query) {
    if (typeof Processor.config === 'undefined') {
      Processor.config = new Config();
    }

    if (typeof Processor.labels === 'undefined') {
      Processor.labels = new Labels();
    }

    if (typeof Processor.mail_fetcher === 'undefined') {
      Processor.mail_fetcher = new MailFetcher();
    }

    if (typeof Processor.stats === 'undefined') {
      Processor.stats = new Stats();
    }

    this.filters = new Filters();
    this.temporal_filters = new TemporalFilters();
    this.query = query;
  }

  function fetch_messages() {
    let results = [];
    Processor.mail_fetcher.applyToQueryMessages(
      this.query, (message) => results.push(message));
    return results;
  }

  function filter_message(message) {
    this.filters.forEach(filter => filter.execute(message));
  }

  function filter_mail() {
    let start = new Date();
    let messages = this.fetchMessages();
    messages.forEach(function (message) {
      this.filterMessage(message);
    }.bind(this));

    if (messages.length > 0) {
      //message.modifyLabels(Processor.config.processed_label, Processor.config.unprocessed_label);
      let unprocessed_label = Processor.labels.getByNameCacheAware(Processor.config.unprocessed_label);
      let processed_label = Processor.labels.getByNameCacheAware(Processor.config.processed_label);
      let batch_modify_message_request = Gmail.newBatchModifyMessagesRequest();
      batch_modify_message_request.ids = messages.map(message => message.id);
      batch_modify_message_request.addLabelIds = [ processed_label.id ];
      batch_modify_message_request.removeLabelIds = [ unprocessed_label.id ];

      Gmail.Users.Messages.batchModify(batch_modify_message_request, Processor.config.emailAddress);
    }

    Processor.stats.log(start, new Date(), 'processor:filter_mail', messages.length);
  }

  function temporal_filter_mail() {
    let start = new Date();
    let messages_processed_counts = this.temporal_filters.map(
      temporal_filter => temporal_filter.filterMail())
    let total_processed = messages_processed_counts.reduce(
      (accumulator, count) => accumulator + count, 0);
    Processor.stats.log(start, new Date(), 'processor:temporal_filter_mail', total_processed);
  }

  function execute() {
    Logger.log('Executing mail filters ...');
    this.filterMail();

    Logger.log('Executing temporal mail filters ...');
    this.temporalFilterMail();
  }

  Processor.prototype = {
    filterMessage: filter_message,
    fetchMessages: fetch_messages,
    filterMail: filter_mail,
    temporalFilterMail: temporal_filter_mail,
    execute: execute,
  };

  return Processor;
}());

var Processor = (function () {
  function Processor() {
    if (typeof Processor.config === 'undefined') {
      Processor.config = new Config();
    }
    
     if (typeof Processor.mail_fetcher === 'undefined') {
      Processor.mail_fetcher = new MailFetcher();
    }
    
    if (typeof Processor.stats === 'undefined') {
      Processor.stats = new Stats();
    }
    
    this.filters = new Filters();
    this.temporal_filters = new TemporalFilters();
    this.unprocessed_query = `label:${Processor.config.unprocessed_label}`;
  }
  
  function fetch_messages() {
    let results = [];
    Processor.mail_fetcher.applyToQueryMessages(
      this.unprocessed_query, (message) => results.push(message));
    return results;
  }
  
  function filter_message(message) {
    this.filters.forEach(filter => filter.execute(message));
  }

  function filter_mail() {
    let start = new Date();
    let messages = this.fetchMessages();
    messages.forEach(message => this.filterMessage(message));
    Processor.stats.log(start, new Date(), 'processor:fetch_mail', messages.length);
  }
  
  function temporal_filter_mail() {
    this.temporal_filters.forEach(
      temporal_filter => temporal_filter.filterMail())
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
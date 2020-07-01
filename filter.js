var Filter = (function() {
  let columns = {
    from: 1,
    to: 2,
    subject: 3,
    has_the_words: 4,
    size: 5,
    has_attachment: 6,
    regex: 7,
    disalbed: 8,
    // intentionally_left_blank = 9
    label: 10,
    mark_read: 11, 
    archive: 12,
    trash: 13,
  };
  
  function Filter(row) {
    this._row = row;
  }
  
  function cross_check_addr_to_contact(addrs, contacts) {
    return addrs.some(email => contacts.some(contact => contact.match(email)));
  }
  
  let check_fns = {
    from: function(message) {
      return cross_check_addr_to_contact(
        this.from.trim().split(/,\s*/),
        message.from);
    },
    to: function(message) {
      return cross_check_addr_to_contact(
        this.to.trim().split(/,\s*/),
        message.to.concat(message.cc).concat(message.bcc));
    },
    subject: function(message) {
      return this.subject.match(message.subject);
    },
    has_the_words: function(message) {
      return message.containsWords(this.has_the_words.split(/\s+/));
    },
    size: function(message) {
      return message.size > this.size;
    },
    has_attachment: function(message) {
      return this.has_attachment && message.attachments.length > 0;
    },
    regex: function(message) {
      return false;
    },
  };
  
  function process(message) {
    if (this.disabled) {
      return;
    }
    
    let process_results = Object.entries(check_fns).map(function([key, val]) {
      return this[key] && check_fns[key].call(this, message);
    }.bind(this));
    

    
    return process_results.some(val => val);
  }
  
  function trigger(message) {    
    if (this.label) {
      this.label.split(/,\s*/).forEach(label => message.applyLabel(label));
    }
    
    if (this.mark_read) {
      message.markRead();
    }
    
    if (this.archive) {
      message.archve();
    }
    
    if (this.trash) {
      message.trash();
    }    
  }
  
  function execute(message) {
    if (this.process(message)) {
      this.trigger(message);
    }
  }
  
  Filter.prototype = {
    process: process,
    trigger: trigger,
    execute: execute,
  };
  
  // generate object getters/setters for config values
  Object.entries(columns).forEach(function([key, val]) {
    Object.defineProperty(Filter.prototype, key, {
      get: function() {
        return this._row[val - 1];
      }
    });
  });
  
  return Filter;
}());
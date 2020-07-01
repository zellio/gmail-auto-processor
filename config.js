var Config = (function() {
  let columns = {
    unprocessed_label: 1,
    processed_label: 2,
    personal_label: 3,
    process_frequency_minutes: 4,
    compaction_frequency_days: 5, 
    max_threads: 6,
    threads_page_size: 7,
    max_recipients: 8,
  }; 
  
  function Config(row = null) {
    if (typeof Config.user_profile === 'undefined') {
      Config.user_profile = Gmail.Users.getProfile('me', {});
    }
    
    // messagesTotal, threadsTotal, historyId, emailAddress
    Object.entries(Config.user_profile).forEach(function ([key, val]) {
      this[key] = val;
    });
    
    this.columns = columns;
  }
  
  Config.prototype = {
  };
  
  Object.defineProperties(Config.prototype, {
    sheet: {
      get: function() {
        return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('config');
      }
    },
    range: {
      get: function() {
        let last_row = this.sheet.getLastRow();
        let last_column = this.sheet.getLastColumn();
        return this.sheet.getRange(2, 1, last_row, last_column);
      }
    },
    values: {
      get: function() {
        return this.range.getValues();
      }
    },
    row: {
      get: function() {
        return this.values[0];
      }
    },
  });
  
  Object.entries(columns).forEach(function([key, val]) {
    Object.defineProperty(Config.prototype, key, {
      get: function() {
        Logger.log(this.row);
        Logger.log(`${key}: ${val}`);
        
        return this.row[val];
      },
    });
  });
  
  return Config;
}());
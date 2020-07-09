var Config = (function() {
  let columns = {
    // labels: 1,
    unprocessed_label: 2,
    processed_label: 3,
    personal_label: 4,
    process_frequency_minutes: 5,
    compaction_frequency_days: 6,
    max_threads: 7,
    threads_page_size: 8,
    max_recipients: 9,
    sequence_number: 10,
    domain: 11,
  };

  function Config(row = null) {
    if (typeof Config.mutex === 'undefined') {
      Config.mutex = new Mutex();
      Config.mutex.createLock('config');
    }

    if (typeof Config.user_profile === 'undefined') {
      Config.user_profile = Gmail.Users.getProfile('me', {});
    }

    // messagesTotal, threadsTotal, historyId, emailAddress
    Object.entries(Config.user_profile).forEach(function ([key, val]) {
      Object.defineProperty(this, key, {
        get: function() {
          return val;
        }
      });
    }.bind(this));

    this.columns = columns;
  }

  function next_sequence_number() {
    return Config.mutex.withWriteLock('config', function() {
      let sequence_number = this.sheet.getRange(2, columns.sequence_number, 1, 1).getValues()[0][0];
      this.sheet.getRange(2, columns.sequence_number, 1, 1).setValues([[sequence_number + 1]]);
      return sequence_number;
    }.bind(this));
  }

  Config.prototype = {
    nextSequenceNumber: next_sequence_number,
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
        return Config.mutex.withReadLock('config', function() {
          return this.sheet.getRange(2, 1, last_row, last_column);
        }.bind(this));
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
        return Config.mutex.withReadLock('config', function() {
          return this.sheet.getRange(2, val, 1, 1).getValues()[0][0];
        }.bind(this));
      },
    });
  });

  return Config;
}());

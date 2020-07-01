var Stats = (function() {
  let statistics_column = {
    log_timestamp: 1,
    start_timestamp: 2,
    end_timestamp: 3,
    method: 4,
    processed_messages: 5,																					
  };
  
  let compactions_columns = {
    compaction_start: 1,
    compaction_end: 2,
    method: 3,
    sum_time_ms: 4,
    sum_messages: 5,	
    processed_row_count: 6,
  };
  
  function Stats() {
    if (typeof Stats.mutex === 'undefined') {
      Stats.mutex = new Mutex();
      Stats.mutex.createLock('stats');
      Stats.mutex.createLock('compaction');
    }
  }
  
  function format_date(date) {
    return Utilities.formatDate(date, "UTC", "yyyy/MM/dd HH:mm:ss.SSS Z");
  }
  
  function log(start, end, method, processed) {
    let row = 2;
    let column = 1;
    let num_rows = 1;
    let num_columns = 5;
    
    Stats.mutex.withWriteLock('stats', function() {
      this.statisticsSheet
        .insertRowBefore(row)
        .getRange(row, column, num_rows, num_columns)
        .clear()
        .setValues([[
          format_date(new Date()),
          format_date(start),
          format_date(end),
          method,
          processed
        ]]);
    }.bind(this));
  }
  
  function minor_compaction() {
    let compaction_start = new Date();
    
    let data = undefined;
    Stats.mutex.withReadLock('stats', function() {
      let last_row = this.statisticsSheet.getLastRow();
      let last_column = this.statisticsSheet.getLastColumn();
      data = this.statisticsSheet.getRange(2, 1, last_row, last_column);
    }.bind(this));
    
    let data_join = {};
    data.getValues().forEach(function(row) {
      let log_timestamp = new Date(row[statistics_column.log_timestamp - 1]);
      let start_timestamp = new Date(row[statistics_column.start_timestamp - 1]);
      let end_timestamp = new Date(row[statistics_column.end_timestamp - 1]);
      let method = row[statistics_column.method - 1];
      let processed_messages = Number(row[statistics_column.processed_messages - 1]);	
      
      if (method == '') { 
        return;
      }
      
      data_join[method] = data_join[method] || {
        start_timestamp: new Date(),
        end_timestamp: new Date(0),
        sum_time_ms: 0,
        sum_messages: 0,	
        processed_row_count: 0,
      };

      data_join[method]['sum_time_ms'] += (end_timestamp - start_timestamp);
      data_join[method]['sum_messages'] += processed_messages;
      data_join[method]['processed_row_count'] += 1;
    });
    
    let compaction_data = Object.entries(data_join).map(function([key, val]) {
      return [
        format_date(compaction_start),
        format_date(new Date()),
        key,
        val['sum_time_ms'],
        val['sum_messages'],
        val['processed_row_count']
      ];
    });

    // write out compaction data
    Stats.mutex.withWriteLock('compaction', function() {
      let row = 2;
      let column = 1;
      let num_rows = compaction_data.length;
      let num_columns = 6;
      
      this.compactionSheet
        .insertRowsBefore(row, num_rows)
        .getRange(row, column, num_rows, num_columns)
        .setValues(compaction_data);
    }.bind(this));
    
    // delete logs
    Stats.mutex.withWriteLock('stats', function() {
      let row = 2;
      let num_rows = this.statisticsSheet.getLastRow() - 1;
      this.statisticsSheet.deleteRows(row, num_rows);
    }.bind(this));
  }
  
  Stats.prototype = {
    log: log,
    minorCompaction: minor_compaction,
//    majorCompaction: major_compaction,
  };
  
  Object.defineProperties(Stats.prototype, {
    statisticsSheet: {
      get: function() {
        return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('statistics');
      }
    },
    compactionSheet: {
      get: function() {
        return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('compactions');
      }
    }
  });
  
  return Stats;
}());
var Filters = (function() {
  function Filters() {
    if (typeof Filters.config === 'undefined') {
      Filters.config = new Config();
    }

    this._filters = [];
    this._personal_filter = new Filter([
      undefined,                      // from: 1,
      Filters.config.emailAddress,    // to: 2,
      undefined,                      // list: 3,
      undefined,                      // subject: 4,
      undefined,                      // has_the_words: 5,
      undefined,                      // size: 6,
      undefined,                      // has_attachment: 7,
      undefined,                      // regex: 8,
      undefined,                      // disabled: 9,
      undefined,                      // // intentionally_left_blank = 10,
      Filters.config.personal_label,  // label: 11,
      undefined,                      // mark_read: 12,
      undefined,                      // archive: 13,
      undefined                      // trash: 14,
    ]);

    build_filters.call(this);
  }

  function build_filters() {
    this.values.forEach(
      row => row.some(val => val) && this._filters.push(new Filter(row)));

    if (Filters.config.personal_label) {
      this._filters.push(this._personal_filter);
    }
  }

  Filters.prototype = {
    get: function(index) {
      return this._filters[index];
    },
    set: function(index, value) {
      return this._filters[index] = value;
    },
    forEach: function(callback) {
      return this._filters.forEach(callback);
    }
  };

  Object.defineProperties(Filters.prototype, {
    sheet: {
      get: function() {
        return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('filters');
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
    length: {
      get: function() {
        return this._filters.length;
      },
      set: function(length) {
        return this._filters.length = length;
      }
    },
  });

  return Filters;
}());

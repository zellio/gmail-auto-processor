var TemporalFilters = (function() {
  function TemporalFilters() {
    this._filters = [];
    build_filters.call(this);
  }

  function build_filters() {
    this.values.forEach(
      row => row.some(val => val) && this._filters.push(new TemporalFilter(row)));
  }

  TemporalFilters.prototype = {
   get: function(index) {
      return this._filters[index];
    },
    set: function(index, value) {
      return this._filters[index] = value;
    },
    forEach: function(callback) {
      return this._filters.forEach(callback);
    },
    map: function(callback) {
      return this._filters.map(callback);
    },
  };

  Object.defineProperties(TemporalFilters.prototype, {
    sheet: {
      get: function() {
        return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('temporal_filters');
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

  return TemporalFilters;
}());

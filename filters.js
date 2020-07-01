var Filters = (function() {
  function Filters() {
    this._filters = []; 
    build_filters.call(this);
  }
  
  function build_filters() {
    this.values.forEach(
      row => row.some(val => val) && this._filters.push(new Filter(row)));
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
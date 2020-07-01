var Labels = (function () {
  function Labels() {
    if (typeof Labels.config === 'undefined') {
      Labels.config = new Config();
    }
    
    if (typeof Labels.labels === 'undefined') {
      Labels.labels = [];
    }
    
    // build shared cache if this is the first call
    if (Labels.labels.length == 0) {
      build_label_cache.call(this);
    }
  }
  
  function build_label_cache() {
    let response = Gmail.Users.Labels.list(Labels.config.emailAddress);
    response.labels.forEach(label => Labels.labels.push(new Label(label.id, label.name)));
  }
  
  function flush_label_cache() {
    labels.length = 0;
  }
  
  function refresh_cache() {
    flush_label_cache.call(this);
    build_label_cache.call(this);
  }
  
  Labels.prototype = {
    refreshCache: refresh_cache,
    get: function(index) {
      return Labels.labels[index];
    },
    set: function(index, value) {
      return Labels.labels[index] = value;
    },
    forEach: function(callback) {
      return Labels.labels.forEach(callback);
    },
    names: function() {
      return Labels.labels.map(label => label.name);
    },
    ids: function() {
      return Labels.labels.map(label => label.id);
    },
    nameExists: function (name) {
      return this.names.some(n => n == name);
    },
    getByName: function(name) {
      return Labels.labels.find(label => label.name == name);
    },
    getByNameCacheAware: function(name) {
      let label = this.getByName(name);
      if (label) {
        return label;
      }
      
      GmailApp.createLabel(name);
      this.refreshCache();
      
      return this.getByName(name);
    },
  };
  
  Object.defineProperties(Labels.prototype, {
    length: {
      get: function() {
        return this.filters.length;
      },
      set: function(length) {
        return Labels.labels.length = length;
      }
    },
  });
  
  return Labels;
}());
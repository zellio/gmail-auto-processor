var Labels = (function () {
  function Labels() {
    if (typeof Labels.config === 'undefined') {
      Labels.config = new Config();
    }

    if (typeof Labels.labels === 'undefined') {
      Labels.labels = [];
      build_label_cache.call(this);
    }
  }

  function build_label_cache() {
    let response = Gmail.Users.Labels.list(Labels.config.emailAddress);
    response.labels.forEach(label => Labels.labels.push(new Label(label.id, label.name)));
  }

  function flush_label_cache() {
    Labels.labels.length = 0;
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
      let transformed_name = Label.nameTransform(name);
      return this.names.some(n => n == transformed_name);
    },
    getByName: function(name) {
      let transformed_name = Label.nameTransform(name);
      return Labels.labels.find(label => label.name == transformed_name);
    },
    createLabel: function(name) {
      if (Label.validName(name)) {
        return GmailApp.createLabel(name);
      }
    },
    getByNameCacheAware: function(name) {
      let label = this.getByName(name);
      if (label) {
        return label;
      }

      this.createLabel(name);
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

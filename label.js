var Label = (function () {
  function Label(id, name) {
    this.id = id;

    if (!valid_label_name(name)) {
      throw new InvalidLabelNameError(name);
    }

    this.name = label_transform(name);
  }

  function valid_label_name(str) {
    return str.indexOf('^') == -1;
  }
  Label.validName = valid_label_name

  function label_transform(str) {
    return str.toLowerCase().replace(/[&(){}|" /]/g, '-');
  }
  Label.nameTransform = label_transform;

  Label.prototype = {
  };

  Object.defineProperties(Label.prototype, {
  });

  return Label;
}());

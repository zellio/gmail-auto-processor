var Contact = (function () {
  function Contact(email = "", name = "") {
    this.name = name;
    this.email = email;
  }

  function match(str) {
    return str == this.name || str == this.email || str == this.fullName;
  }

  Contact.prototype = {
    match: match
  };

  Object.defineProperties(Contact.prototype, {
    fullName: {
      get: function() {
        if (this.name != "") {
          return `${this.name} <${this.email}>`;
        }
        else {
          return this.email;
        }
      }
    },
  });

  return Contact;
}());

var FlatMessage = (function() { 
  function FlatMessage(message) {
    if (typeof FlatMessage.config === 'undefined') {
      FlatMessage.config = new Config();
    }
    
    if (typeof FlatMessage.labels === 'undefined') {
      FlatMessage.labels = new Labels();
    }
    
    this._message = message;
  }

  function contains_words(words) {
    return words.length != 0 && words.reduce(
      (accumulator, word) => !!(this.plainBody.match(word)) && accumulator, true); 
  }
  
  function apply_label(name) {
    let label = FlatMessage.labels.getByNameCacheAware(name);
    let resource = Gmail.newModifyMessageRequest();
    resource.addLabelIds = [ label.id ];
    return Gmail.Users.Messages.modify(resource, FlatMessage.config.emailAddress, this.id);
  }
  
  function remove_label(name) {
    let label = FlatMessage.labels.getByNameCacheAware(name);
    let resource = Gmail.newModifyMessageRequest();
    resource.removeLabelIds = [ label.id ];
    return Gmail.Users.Messages.modify(resource, FlatMessage.config.emailAddress, this.id);
  }
  
  function mark_read() {
    return this._message.markRead();
  }
  
  function archive() {
    return this.removeLabel('INBOX');
  }
  
  function trash() {
    return this._message.moveToTrash();
  }

  FlatMessage.prototype = {
    containsWords: contains_words,
    applyLabel: apply_label,
    removeLabel: remove_label,
    markRead: mark_read,
    archive: archive,
    trash: trash,
  };
  
  function explode_email_csv(str) {
    let extract_regex = /\s*(?:(.+)\s+)?<(.+)>/g;
    let ret = [];
    
    str.split(/,\s*/).forEach(function (email) {
      let matches = extract_regex.exec(email) || [];
      
      if (matches.length > 0) {
        ret.push(new Contact(matches[2], matches[1]));
      }
      else {
        ret.push(new Contact(email, undefined));
      }
    });
      
    return ret;
  }
  
  Object.defineProperties(FlatMessage.prototype, {
    bcc: {
      get: function() {
        this._bcc = this._bcc || explode_email_csv(this._message.getBcc());
        return this._bcc;
      }
    },
    body: {
      get: function() {
        return this._message.getBody();
      }
    },
    cc: {
      get: function() {
        this._cc = this._cc || explode_email_csv(this._message.getCc());
        return this._cc;
      }
    },
    date: {
      get: function() {
        return new Date(this._message.getDate());
      }
    },
    from: {
      get: function() {
        this._from = this._from || explode_email_csv(this._message.getFrom())
        return this._from;
      }
    },
    // header
    id: {
      get: function() {
        return this._message.getId();
      }
    },
    // plain_body
    rawContent: {
      get: function() {
        return this._message.getRawContent();
      }
    },
    replyTo: {
      get: function() {
        this._reply_to = this._reply_to || explode_email_csv(this._message.getReplyTo());
        return this._reply_to;
      }
    },
    to: {
      get: function() {
        this._to = this._to || explode_email_csv(this._message.getTo());
        return this._to; 
      }
    },
    subject: {
      get: function() {
        return this._message.getSubject();
      }
    },
    draft: {
      get: function() {
        return this._message.isDraft();
      }
    },
    chat: {
      get: function() {
        return this._message.isInChats();
      }
    },
    attachments: {
      get: function() {
        return this._message.getAttachments();
      }
    },
    size: {
      get: function() {
        return this.rawContent.length + this.attachments.reduce(
          (accumulator, attachment) => accumulator + attachment.getSize(), 0); 
      }
    },
    plainBody: {
      get: function() {
        return this._message.getBody();
      }
    }
  });

  return FlatMessage;
}());
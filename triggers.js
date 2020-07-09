var Triggers = {
  ProcessMail: function() {
    Logger.log('Running process mail ...');

    let config = new Config();
    let labels = new Labels();
    let unprocessed_label = labels.getByNameCacheAware(config.unprocessed_label);
    let processed_label = labels.getByNameCacheAware(config.processed_label);

    let processor = new Processor(`label:${unprocessed_label.name} AND NOT label:${processed_label.name}`);
    return processor.execute();
  },

  MinorCompaction: function() {
    Logger.log('Running log compaction ...');

    let stats = new Stats();
    stats.minorCompaction();
  },

  MajorCompaction: function() {
    Logger.log('Running major compaction ...');

    let stats = new Stats();
    stats.majorCompaction();
  },

  EditConfig: function(event) {
    Logger.log('Running edit handler ...');

    let range = event.range;
    let sheet = range.getSheet();

    switch (sheet.getName()) {
      case 'config':
        if (range.getRow() == 2) {
          let config = new Config();
          let column = range.getColumn() - 1; // First row is K/V Descriptor

          if (column == config.columns.process_frequency_minutes) {
            if ([1, 5, 10, 15, 30].indexOf(Number(config.process_frequency_minutes)) > -1) {
              UpdateTrigger('ProcessMail');
            }
          }
          else if (column == config.columns.compaction_frequency_days) {
            if (Number(config.compaction_frequency_days) > 0) {
              UpdateTrigger('CompactLogs');
            }
          }
        }

        break;
    }

    return true;
  },

  Backfill: function() {
    Logger.log("Running backfill job ...");

    let config = new Config();
    let labels = new Labels();
    let unprocessed_label = labels.getByNameCacheAware(config.unprocessed_label);
    let processed_label = labels.getByNameCacheAware(config.processed_label);

    let processor = new Processor(`NOT label:{${unprocessed_label.name} ${processed_label.name}}`);
    return processor.execute();
  },
};

var TriggerInstallers = {
  ProcessMail: function() {
    let config = new Config();
    return ScriptApp.newTrigger('Triggers.ProcessMail')
      .timeBased()
      .everyMinutes(config.process_frequency_minutes)
      .create();
  },

  CompactLogs: function() {
    let config = new Config();
    return ScriptApp.newTrigger('Triggers.CompactLogs')
      .timeBased()
      .everyDays(config.compaction_frequency_days)
      .create();
  },

  EditConfig: function() {
    return ScriptApp.newTrigger('Triggers.EditConfig')
      .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
      .onEdit()
      .create();
  },
};

function InstallTrigger(trigger_name) {
  Logger.log(`Installing trigger: Triggers.${trigger_name}`);

  let installer = TriggerInstallers[trigger_name];
  if (installer) {
    installer.call();
  }
}

function UninstallTrigger(name) {
  let trigger_name = `Triggers.${name}`;

  Logger.log(`Uninstalling trigger: ${trigger_name}`);

  let trigger = ScriptApp.getProjectTriggers().find(
    trigger => trigger.getHandlerFunction()	== trigger_name);

  if (trigger) {
    ScriptApp.deleteTrigger(trigger);
  }
}

function UpdateTrigger(trigger_name) {
  UninstallTrigger(trigger_name);
  InstallTrigger(trigger_name);
}

function InstallTriggers() {
  Object.keys(TriggerInstallers).forEach(function(key) {
    InstallTrigger(key);
  });
}

function UninstallTriggers() {
  Object.keys(TriggerInstallers).forEach(function(key) {
     UninstallTrigger(key);
  });
}

function UpdateTriggers() {
  Object.keys(TriggerInstallers).forEach(function(key) {
    UpdateTrigger(key);
  });
}

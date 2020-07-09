function onOpen(event) {
  let ui = SpreadsheetApp.getUi();

  ui.createMenu('GMail Auto-Processor')
    .addItem('Process Mail', 'Triggers.ProcessMail')
    .addItem('Run backfill job', 'Triggers.Backfill')
    .addSeparator()
    .addSubMenu(ui.createMenu('Triggers')
      .addItem('Install Triggers', 'InstallTriggers')
      .addItem('Uninstall Triggers', 'UninstallTriggers')
      .addItem('Update Triggers', 'UpdateTriggers'))
    .addSubMenu(ui.createMenu('Compaction')
      .addItem('Run Minor Compaction', 'Triggers.MinorCompaction')
      .addItem('Run Major Compaction', 'Triggers.MajorCompaction'))
    .addToUi();
}

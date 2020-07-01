function onOpen(event) {
  let ui = SpreadsheetApp.getUi();
  
  ui.createMenu('GMail Auto-Processor')
    .addSeparator()
    .addItem('Install Triggers', 'InstallTriggers')
    .addItem('Uninstall Triggers', 'UninstallTriggers')
    .addItem('Update Triggers', 'UpdateTriggers')
    .addToUi();
  // ui.createMenu('Custom Menu').addToUi();
}
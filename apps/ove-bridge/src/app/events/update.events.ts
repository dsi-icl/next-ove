/* global console, process */
// noinspection DuplicatedCode

import { dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import { env } from '@ove/ove-bridge';

export default () => {
  if (env.NODE_ENV !== 'production') {
    return () => console.log('Auto update skipped');
  }

  autoUpdater.on('update-downloaded', (info) => {
    const dialogOpts = {
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message:
        process.platform === 'win32'
          ? JSON.stringify(info.releaseNotes)
          : JSON.stringify(info.releaseName),
      detail: `A new version, released on ${info.releaseDate}, 
          has been downloaded. Restart the application to apply the updates.`,
    };

    dialog.showMessageBox(dialogOpts).then(({ response }) => {
      if (response === 0) autoUpdater.quitAndInstall();
    });
  });

  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...\n');
  });

  autoUpdater.on('update-available', () => {
    console.log('New update available!\n');
  });

  autoUpdater.on('update-not-available', () => {
    console.log('Up to date!\n');
  });

  autoUpdater.on('error', (message) => {
    console.error('There was a problem updating the application');
    console.error(message, '\n');
  });
  return () =>
    autoUpdater
      .checkForUpdates()
      .then((info) =>
        console.log(`Updating: ${JSON.stringify(info?.updateInfo)}`)
      );
};

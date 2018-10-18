import _ from 'lodash';

import IOSUploader from './upload/IOSUploader';
import AndroidUploader from './upload/AndroidUploader';
import log from '../log';

const COMMON_OPTIONS = ['id', 'latest', 'path'];

export default program => {
  const androidCommand = program
    .command('upload:android [projectDir]')
    .alias('ua')
    .option('--key <key>', 'path to the JSON key used to authenticate with the Google Play Store')
    .description(
      'Uploads standalone android app to the Google Play Store (it works on macOS only). Uploads the latest build by default.'
    )
    .asyncActionProjectDir(createUploadAction(AndroidUploader, [...COMMON_OPTIONS, 'key']));
  setCommonOptions(androidCommand, '.apk');

  const iosCommand = program
    .command('upload:ios [projectDir]')
    .alias('ui')
    .option(
      '--apple-id <apple-id>',
      'your Apple ID username (you can also set EXPO_APPLE_ID env variable)'
    )
    .option(
      '--apple-id-password <apple-id-password>',
      'your Apple ID password (you can also set EXPO_APPLE_ID_PASSWORD env variable)'
    )
    .description(
      'Uploads standalone app to App Store (it works on macOS only). Uploads the latest build by default.'
    )
    .asyncActionProjectDir(createUploadAction(IOSUploader, [...COMMON_OPTIONS, 'appleId']));
  setCommonOptions(iosCommand, '.ipa');
};

function setCommonOptions(command, fileExtension) {
  command
    .option('--id <id>', 'id of the build to upload')
    .option('--latest', 'uploads the latest build')
    .option('--path <path>', `path to the ${fileExtension} file`);
}

function createUploadAction(UploaderClass, optionKeys) {
  return async (projectDir, command) => {
    ensurePlatformIsSupported();
    await ensureOptionsAreValid(command);

    const options = _.pick(command, optionKeys);
    const uploader = new UploaderClass(projectDir, options);
    await uploader.upload();
  };
}

function ensurePlatformIsSupported() {
  if (process.platform !== 'darwin') {
    log.error('Unsupported platform! This feature works on macOS only.');
    process.exit(1);
  }
}

async function ensureOptionsAreValid(command) {
  const args = _.pick(command, COMMON_OPTIONS);
  if (_.size(args) > 1) {
    throw new Error(`You have to choose only one of --path, --id or --latest parameters`);
  }
}

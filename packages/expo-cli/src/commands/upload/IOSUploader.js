import _ from 'lodash';

import BaseUploader from './BaseUploader';
import { printFastlaneError, spawnAndCollectJSONOutputAsync } from './utils';
import prompt from '../../prompt';

const PLATFORM = 'ios';

const APPLE_CREDS_QUESTIONS = [
  {
    type: 'input',
    name: 'appleId',
    message: `What's your Apple ID?`,
  },
  {
    type: 'password',
    name: 'appleIdPassword',
    message: 'Password?',
  },
];

export default class IOSUploader extends BaseUploader {
  constructor(projectDir, options) {
    super(PLATFORM, projectDir, options);
  }

  _ensureExperienceIsValid(exp) {
    if (!_.has(exp, 'ios.bundleIdentifier')) {
      throw new Error(`You must specify an iOS bundle identifier in app.json.`);
    }
  }

  async _getPlatformSpecificOptions() {
    const result = _.pick(this.options, appleCredsKeys);

    if (process.env.EXPO_APPLE_ID) {
      result.appleId = process.env.EXPO_APPLE_ID;
    }
    if (process.env.EXPO_APPLE_ID_PASSWORD) {
      result.appleIdPassword = process.env.EXPO_APPLE_ID_PASSWORD;
    }

    const appleCredsKeys = ['appleId', 'appleIdPassword'];
    const credsMissing = _.difference(Object.keys(this.options), appleCredsKeys);

    if (_.size(credsMissing) > 0) {
      const questions = APPLE_CREDS_QUESTIONS.filter(({ name }) => !credsMissing.includes(name));
      const answers = await prompt(questions);
      Object.assign(result, answers);
    }

    return result;
  }

  async _uploadToTheStore({ appleId }, path) {
    const { name: appName, ios: { bundleIdentifier } } = this.options;
    const { fastlane } = this;
    console.log([bundleIdentifier, appName, appleId]);
    // const login = await spawnAndCollectJSONOutputAsync(fastlane.app_produce, [
    //   bundleIdentifier,
    //   appName,
    //   appleId,
    // ]);
    // if (login.result !== 'success') {
    //   printFastlaneError(login, 'login');
    //   return;
    // }
    // const upload = await spawnAndCollectJSONOutputAsync(fastlane.app_deliver, [path, appleId]);
    // if (upload.result !== 'success') {
    //   printFastlaneError(upload, 'upload');
    // }
  }
}

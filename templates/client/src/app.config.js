
const webpackConfig = {
  name:             'New Client',          // can affect seo
  short_name:       'New Client',          // 12 characters or less (homescreen icon name)
  description:      'A new Spriteful PWA', // can affect seo
  display:          'standalone',
  theme_color:      '#FFFFFF',
  background_color: '#FFFFFF',
  cacheId:          'spriteful-app-cache'
};

// app specific configurations
const swReadyMessage = 'This app can now work offline!';

const swUpdateMessage = 'New version available!';

const termsOfServiceUrl = '';

const privacyPolicyUrl  = '';

// firebase sdk settings
const firebaseConfig = {
  apiKey:            '',
  authDomain:        '',
  databaseURL:       '',
  projectId:         '',
  storageBucket:     '',
  messagingSenderId: ''
};


const appUserAndData = {
  // true, user is asked if they trust device so they have the option
  //       to override this setting,
  //       if user trust the device, session is set to 'local', 
  //       user and data is persisted offline and only cleared on explicit signout
  // false, user persistence is set to 'session', they are signed out whenever window or tab
  //        is closed and data is not stored locally for offline use 
  trustedDevice: true,
  // if false, block app with signin form until user signs up or signs in from a whitelist in the database
  // if true, allow anonymous users to use app until they decide to sign up or sign in
  anonymous: true,
  // web worker image size of processing output, in pixels
  imageSize: 512,
  // web worker output quality of image processing, int 0-100
  imageQuality: 60,
  // web worker number of photos to simultaneously upload to db
  photoUploadBatchSize: 3
};
// spriteful-settings.js
// for switching between dark and light themes
// NOTE:  you must update global theme styles in index.html (--app-some-color: #000000;)
// NOTE:  iOS fix!! -> lightTextTruncate and darkTextTruncate are used for spriteful-edit-inputs
//        fade out input text truncation. They are the rgb equivalent of their respective
//        hex background-color with a 0% alpha. Must update them when changing theme background colors
const theme = {
  lightBodyColor:    '#eeeeee',
  lightBackground:   '#FFFFFF',
  lightText:         '#212121',
  lightTextTruncate: 'rgba(255, 255, 255, 0)',
  darkBodyColor:     '#000000',
  darkBackground:    '#212121',
  darkText:          '#FFFFFF',
  darkTextTruncate:  'rgba(33, 33, 33, 0)'
};

// must use older module syntax for webpack.config.js
module.exports = {
  appUserAndData,
  firebaseConfig,
  privacyPolicyUrl,
  swReadyMessage,
  swUpdateMessage,
  termsOfServiceUrl,
  theme,
  webpackConfig
};


const webpackConfig = {
  name:             'New Client',         // Can affect seo.
  short_name:       'New Client',         // 12 characters or less (homescreen icon name).
  description:      'A new Longlost PWA', // Can affect seo.
  display:          'standalone',
  theme_color:      '#FFFFFF',
  background_color: '#FFFFFF',
  cacheId:          'longlost-app-cache'
};

// App specific configurations.
const swReadyMessage = 'This app can now work offline!';

const swUpdateMessage = 'New version available!';

const termsOfServiceUrl = '';

const privacyPolicyUrl  = '';

// Firebase sdk settings.
const firebaseConfig = {
  apiKey:            '',
  authDomain:        '',
  databaseURL:       '',
  projectId:         '',
  storageBucket:     '',
  messagingSenderId: '',
  appId:             '',
  measurementId:     ''
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
  anonymous: false
};

// This text is part of the text displayed to the user in a modal if they deny permission
// to use the device camera after attempting to use the camera system. See `app-camera-system`.
const appCameraPermissionDenied = 
  'We will never sell your data to third-party vendors or share your data with advertising agencies.';

// app-settings.js
// for switching between dark and light themes
// NOTE:  you must update global theme styles in index.html (--app-some-color: #000000;)
// NOTE:  iOS fix!! -> lightTextTruncate and darkTextTruncate are used for edit-inputs
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

// Must use older module syntax for webpack.config.js
module.exports = {
  appCameraPermissionDenied,
  appUserAndData,
  firebaseConfig,
  privacyPolicyUrl,
  swReadyMessage,
  swUpdateMessage,
  termsOfServiceUrl,
  theme,
  webpackConfig
};

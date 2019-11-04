
# Longlost Starter Kit Notes



### app.config.js

carefully update all elements
update index.html theme colors to match the 'theme' obj


### app-pay


update gateway config in firebase cloud functions index.js

if setup as a google pay merchant
and update braintreeConfig.googleMerchantId in app.config.js

if setup with a paypal business account
link business account with braintree account (via braintree dashboard)

set processing setting in braintree dashboard
  * cvv
  * googlePay
  * applePay
  * paypal


### Firebase Cli and Functions


**Keep these tools up to date with npm and yarn**

cd into the functions/ directory and run:

yarn add firebase-functions@latest --dev
npm install -g firebase-tools



**deploy cloud functions**

deploy all functions in ./functions/index.js:

firebase deploy --only functions


partial deploy a specific function:

firebase deploy --only functions:myFunctionName




### App Theming


  <style id="custom-style">

    html {
      /**
       *
       * App themes go here
       *
       */
    }

  </style>




### Testing


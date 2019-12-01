'use strict';


const functions = require('firebase-functions');
const admin     = require('firebase-admin'); // access Auth, Realtime Database and Firestore
const os        = require('os');
const fs        = require('fs');
const path      = require('path');
const crypto    = require('crypto');
const mkdirp    = require('mkdirp-promise');
const json2csv  = require('json2csv').parse;
const {
  createUser,
  deleteUser
}               = require('@longlost/boot/cloud').init(admin, functions);
const optimizer = require('@longlost/file-uploader/cloud').init(admin, functions);


// must add this to package.json when deploying (for es6 syntax)
// must remove this when adding/upgrading packages

// ,
//   "engines": {
//     "node": "8"
//   }





// firebase global setup
const app = admin.initializeApp();
const db  = admin.firestore();



// helper functions

const getReportCsv = async (start, end) => {      
  const assessments    = [];
  const assessmentsRef = db.collection('assessments');
  const snap = await assessmentsRef.
                       where('start', '>=', start).
                       where('start', '<=', end).
                       orderBy('start').
                       get();

  snap.forEach(doc => {
    const assessment = doc.data();
    assessments.push(assessment);
  });

  return json2csv(assessments);
};


const writeFile = (path, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, error => {  
      if (error) { reject(error); }
      resolve();
    });
  });
};



// main exported functions

exports.createUser = createUser;

exports.deleteUser = deleteUser;

exports.optimize = optimizer;



// allow admins to download a csv formatted assessments report file
// for further offline processing
exports.report = functions.https.onCall(async (data, context) => {
  try {    
    const {uid} = context.auth;
    // check if this is being called by and admin
    const adminDoc  = await db.collection('admins').doc(uid).get();
    const adminData = adminDoc.data();
    // only allow admins to run reports
    if (!adminData || !adminData.isAdmin) {
      return null;
    }
    // starting and ending date range to run the report on
    const {end, start}   = data;
    // start and ending timestamps for the 'start' field in assessments
    const csv            = await getReportCsv(start, end); 
    const contentType    = 'text/csv';
    const filePath       = 'report.csv';
    const bucket         = admin.storage().bucket();
    const randomFileName = `${crypto.randomBytes(20).toString('hex')}${path.extname(filePath)}`;
    const destination    = `reports/${randomFileName}`;
    const tempLocalFile  = path.join(os.tmpdir(), randomFileName);
    const tempLocalDir   = path.dirname(tempLocalFile);  
    const config = {
      action:  'read',
      expires: '03-01-2500'
    }; 
    // Create the temp directory from where the storage file will be uploaded.
    await mkdirp(tempLocalDir);    
    await writeFile(tempLocalFile, csv);
    await bucket.upload(tempLocalFile, {
      destination, 
      predefinedAcl: 'publicRead', 
      metadata:      {contentType}
    });
    fs.unlinkSync(tempLocalFile);
    const file  = bucket.file(destination);
    const [url] = await file.getSignedUrl(config);
    return url;
  }
  catch (error) {
    console.error(error);
    throw new functions.https.HttpsError('unknown', 'report error', error);
  }
});




// TODO:
//     add sendgrid, pull it out of checkout and instead, pass it into checkout


// exports.sendEmailToDeletedUser = functions.auth.user().
//   onDelete(async user => {
//     try {
//       const {
//         email,
//         displayName        
//       } = user;      
//       const {
//         business,
//         sendgrid
//       } = checkoutOpts;
//       const msg = {
//         to:         email,      
//         from:       business.address.email,
//         subject:   'Sorry to see you go.',
//         templateId: sendgrid.deleteAccountTemplate,
//         dynamicTemplateData: {          
//           email,
//           displayName
//         }
//       };      
//       await checkout.sendgrid.send(msg); // must await to catch the error here      
//       return null;
//     }
//     catch (error) {
//       console.error('sendEmailToDeletedUser error: ', error);
//       throw new functions.https.HttpsError('unknown', 'sendEmailToDeletedUser error', error);
//     }      
//   });

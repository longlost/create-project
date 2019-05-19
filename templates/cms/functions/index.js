'use strict';


const functions = require('firebase-functions');
const admin     = require('firebase-admin'); // access Auth, Realtime Database and Firestore
const os        = require('os');
const fs        = require('fs');
const path      = require('path');
const crypto    = require('crypto');
const mkdirp    = require('mkdirp-promise');
const spawn     = require('child-process-promise').spawn;
const json2csv  = require('json2csv').parse;


// must add this to package.json when deploying (for es6 syntax)
// must remove this when adding/upgrading packages

// ,
//   "engines": {
//     "node": "8"
//   }





// firebase global setup
const app = admin.initializeApp();
const db  = admin.firestore();
app.firestore().settings({timestampsInSnapshots: true});



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


// When an image is uploaded in the Storage bucket,
// it is optimized automatically using ImageMagick.
exports.optimizeStorageImages = functions.storage.object().onFinalize(async object => {
  try {
    const {
      cacheControl,
      contentDisposition,
      contentEncoding,
      contentLanguage,
      contentType,
      customMetadata,
      metageneration,
      metadata: oldMetadata,
      name:     filePath,
      size
    } = object;
    // console.log('incoming file size: ', size);

    // Exit if this is triggered on a file that is not an image.
    if (!contentType.startsWith('image/')) {
      console.log('This file is not an image. Not optimizing.');
      return null;
    }
    // Exit if the image is already optimized.
    if ((
      oldMetadata && 
      oldMetadata.customMetadata && 
      oldMetadata.customMetadata.optimized) || 
      metageneration > 1
    ) {
      console.log('Exiting. Already optimized.');
      return null;
    }

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // HACK:
    //      Cannot set new metadata for some reason.
    //      Gave up after spending many hours on research. 
    //      Currently no resolution other than
    //      checking if its undefined, which is the case 
    //      after trying to set it in the upload function as per docs
    // console.log('object: ', object);
    // console.log('oldMetadata: ', oldMetadata);
    // console.log('customMetadata: ', customMetadata);
    // console.log('metageneration: ', metageneration);
    if (!oldMetadata) {
      console.log('Exiting. Already optimized but no metadata.');
      return null;
    }
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    
    const metadata = {
      cacheControl,
      contentDisposition,
      contentEncoding,
      contentLanguage,
      contentType,
      customMetadata: {
        'optimized':    'true',
        'originalSize': `${size}`
      }
      // To enable Client-side caching you can set the Cache-Control headers here. Uncomment below.
      // 'Cache-Control': 'public,max-age=3600',
    };
    // Create random filename with same extension as uploaded file.
    const randomFileName     = `${crypto.randomBytes(20).toString('hex')}${path.extname(filePath)}`;
    const randomFileName2    = `${crypto.randomBytes(20).toString('hex')}${path.extname(filePath)}`;
    const tempLocalFile      = path.join(os.tmpdir(), randomFileName);
    const tempLocalDir       = path.dirname(tempLocalFile);
    const tempLocalOptimFile = path.join(os.tmpdir(), randomFileName2);
    const bucket             = admin.storage().bucket(object.bucket);
    // Create the temp directory where the storage file will be downloaded.
    await mkdirp(tempLocalDir);
    // Download file from bucket.
    await bucket.file(filePath).download({destination: tempLocalFile});
    const imgOptimizationOptions = [
      tempLocalFile,
      '-filter',     'Triangle',
      '-define',     'filter:support=2',
      '-resize',     '1024>', // max width is 1024px
      '-unsharp',    '0.25x0.25+8+0.065',
      '-dither',     'None',
      '-posterize',  '136',
      '-quality',    '82',
      '-define',     'jpeg:fancy-upsampling=off',
      '-define',     'png:compression-filter=5',
      '-define',     'png:compression-level=9',
      '-define',     'png:compression-strategy=1',
      '-define',     'png:exclude-chunk=all',
      '-interlace',  'none',
      '-colorspace', 'sRGB',
      '-strip',
      tempLocalOptimFile
    ];
    // Convert the image to JPEG using ImageMagick.
    await spawn('convert', imgOptimizationOptions);
    // console.log('optimized image created at', tempLocalOptimFile);
    // Uploading the JPEG image.
    await bucket.upload(tempLocalOptimFile, {
      destination:    filePath, 
      predefinedAcl: 'publicRead', 
      metadata
    });
    // console.log('Done optimizing');
    // Once the image has been converted delete the local files to free up disk space.
    fs.unlinkSync(tempLocalOptimFile);
    fs.unlinkSync(tempLocalFile);
    
    // !!!!!!!!!!!!!!!! Code sample below does not work as of 11/6/2018 !!!!!!!!!!!!!!!!!!!!!!
    //    This would be the perfered best practice way to get a 
    //    new download url for the processed image, but
    //    it becomes invalid after 10/12 days because of gcs service 
    //    account keys getting renewed in their backend.  
    //    see: https://github.com/googleapis/nodejs-storage/issues/244
    // Get the Signed URLs for the thumbnail and original image.
    // const config = {
    //   action:  'read',
    //   expires: '03-01-2500',
    // };
    // const file  = bucket.file(filePath);
    // // Go to your project's Cloud Console > IAM & admin > IAM, 
    // // Find the App Engine default service account and ADD
    // // the Service Account Token Creator ROLE to that member. 
    // // This will allow your app to create signed public URLs to the images.
    // const [url]      = await file.getSignedUrl(config);
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    const url        = `https://storage.googleapis.com/${object.bucket}/${object.name}`; // short term workaround/hack
    const words      = filePath.split('/');
    const coll       = words.slice(0, words.length - 2).join('/');
    const lastWord   = words[words.length - 1];
    const fileNames  = lastWord.split('.');
    const fileName   = fileNames.slice(0, fileNames.length - 1).join('.');
    const doc        = words.slice(words.length - 2, words.length - 1)[0];
    await db.collection(coll).doc(doc).set({images: {[fileName]: {url}}}, {merge: true});
    return null;
  }
  catch (error) {
    console.error(error);
    throw new functions.https.HttpsError('unknown', 'image optimization error', error);
  }
});
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


exports.seedFireStoreUser = functions.auth.user().onCreate(user => {
  try {
    // bypass methods on the user object because firebase does allow them
    const {displayName, email, phoneNumber, photoURL, uid} = user; 
    const userData = {displayName, email, phoneNumber, photoURL, uid};
    return db.collection('users').doc(uid).set(userData);      
  }
  catch (error) {
    console.error(error);
    throw new functions.https.HttpsError('unknown', 'seedFireStoreUser error', error);
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

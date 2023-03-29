const { google } = require('googleapis');
const { getOAuth2Client } = require('./getOAuth2Client');
const fs = require("fs-extra");
const path = require("path");
const config = require("config");

const getStoredcalendarId = async (credsPath) => {
  const storedCredentialsExist = await fs.exists(credsPath);
  //console.log('storedCredentialsExist:' + storedCredentialsExist)
  if (storedCredentialsExist) {
    const storedCredentialsData = await fs.readJson(credsPath);
    return storedCredentialsData;
  } 

  process.exit(0);
};

const calendarList = async (calendar) => {
  const calendars = await calendar.calendarList.list({});
  return calendars.data.items;
}

const getEventsFromCalendar = async (calendar, calendarId, endDate) => {
  try {
    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: new Date().toISOString(),
      timeMax: new Date(endDate).toISOString(),
      maxResults: 1000,
      singleEvents: true,
      orderBy: "startTime",
      timeZone: "Europe/Brussels"
    });

    const events = response.data.items;

    // console.log(`Events from calendar "${calendarId}" between ${new Date().toLocaleDateString()} and ${new Date(endDate).toLocaleDateString()}:`);
    // events.forEach((event, i) => {
    //   const start = event.start.dateTime || event.start.date;
    //   console.log(`${i + 1}: ${event.summary} - ${start}`);
    // });

    return events;
  } catch (error) {
    console.error(error);
  }
}

// const downloadfile = async (drive,fileId) => {
//   const savePath = __dirname.replace('tools','') + `html/img/pictures/${fileId}.jpg`;
//   let downloadfile = false;

//   if (!fs.existsSync(savePath)) downloadfile = true;

//   if (fs.existsSync(savePath))
//     console.log(fs.statSync(savePath))
//     if (fs.statSync(savePath) <= 100) downloadfile = true;

//   if (downloadfile) {
    
//     return new Promise((resolve, reject) => {
//       const dest = fs.createWriteStream(savePath);
//       drive.files.get(
//         { fileId: fileId, alt: 'media' }, { responseType: 'stream' },
//         (err, result) => {
//           if (err) reject(err);
//             //console.log(result.data)
          
//           result.data
//             .on('end', () => {
//               console.log('Done');
//             })
//             .on('error', _e => {
//               console.log('Error', _e);
//               if (_e) reject(_e);
//             })
//             .pipe(dest);
//           dest.on('finish', () => {
//             console.log('Download finished');
//             resolve(true);
//           });
//         }
//       );
//     });
    

   
//   }
// }


const downloadfile = async (drive, fileId) => {
  const savePath = __dirname.replace('tools','') + `html/img/pictures/${fileId}.jpg`;
  let downloadfile = false;

  if (!fs.existsSync(savePath)) {
    downloadfile = true;
  } else {
    const stat = fs.statSync(savePath);
    if (stat.size <= 0) {
      downloadfile = true;
    } else {
      console.log(`File already exists: ${savePath}`);
    }
  }

  if (downloadfile) {
    try {
      if (fs.existsSync(savePath)) {
        fs.unlinkSync(savePath);
        console.log(`Deleted existing file: ${savePath}`);
      }

      const dest = fs.createWriteStream(savePath);
      const result = await drive.files.get(
        { fileId: fileId, alt: 'media' }, { responseType: 'stream' }
      );
      result.data
        .on('end', () => {
          console.log('Done');
        })
        .on('error', err => {
          console.error(`Error downloading file: ${err.message}`);
          dest.destroy();
        })
        .pipe(dest);
      await new Promise((resolve, reject) => {
        dest.on('finish', () => {
          console.log(`Download finished: ${savePath}`);
          resolve();
        });
        dest.on('error', err => {
          console.error(`Error writing file: ${err.message}`);
          fs.unlinkSync(savePath);
          reject(err);
        });
      });
    } catch (err) {
      console.error(`Error downloading file: ${err.message}`);
      throw err;
    }
  }
};


const getCalendarlist = async (getOne) => {
  const auth = await getOAuth2Client();
  const calendar = await google.calendar({ version: "v3", auth: auth });
  const mycalendars = await calendarList(calendar);

  let toreturn = ''
  mycalendars.forEach((mycalendar, i) => {
    if (mycalendar.summary == getOne) {
      toreturn = mycalendar;
      return
    }
    // if (!getOne) {
    //   console.log({nr:i+1,summary:mycalendar.summary,id:mycalendar.id});
    // }
  });

  if (toreturn) return toreturn;
  return mycalendars;
}


// const getEventlist = async (calendarId) => {

//     const auth = await getOAuth2Client();
//     const calendar = await google.calendar({ version: "v3", auth: auth });
//     const mycalendars = await calendarList(calendar);
//     const drive = google.drive({ version: 'v3', auth });

//     //const endDate = "2023-12-31"; // end date to filter events
    
//     const today = new Date();
//     const endDate = new Date(today.getFullYear() + 2, today.getMonth(), today.getDate());

//     const exclude = [process.argv[2]];
//     //console.log(process.argv[2]);
//     const myevents = await getEventsFromCalendar(calendar, calendarId, endDate)

//     //console.log(`Events from calendar "${calendarId}" between ${new Date().toLocaleDateString()} and ${new Date(endDate).toLocaleDateString()}:`);
//     const items = []
//     c = 0;

//       myevents.forEach( async (event, i) => {
//         if (!exclude.some(word => event.summary.toLowerCase().includes(word))) {
//           // c++;
//           const start = event.start.dateTime || event.start.date;
//           // console.log(`${c}: \n${event.summary} - ${start}`);
//           // console.log(`${event.description}`)
//           // console.log(event.description.split('/d/')[1].split('/')[0])

//           ///console.log(start)
//           const options = { day: 'numeric', month: 'numeric', year: 'numeric' };
//           const formattedDate = new Date(start).toLocaleString('en-US', options);

//           //console.log(formattedDate)

//           await downloadfile(drive,event.description.split('/d/')[1].split('/')[0])
          
//           const savePath = __dirname.replace('tools','') + `/html/img/pictures/${event.description.split('/d/')[1].split('/')[0]}.jpg`;
//           items.push({ "title": event.summary, "subtitle": "", "arg": `${formattedDate}`, "valid": true, "icon": { "path": savePath } });
//           //console.log(JSON.stringify(items,null,2))
//           //process.stdout.write(output);
//         } 
//         // else {
//         //   output = {"items": [ { "title": "Not found...", "subtitle": "", "arg": process.argv[2], "valid": true, "icon": { "path": "" } } ] }
//         //   console.log(JSON.stringify(output,null,2))
//         // }
//       })
    

//     console.log(items)
   
// }



const getEventList = async (calendarId, excludeWords = [], includeWords = []) => {
  const auth = await getOAuth2Client();
  const calendar = await google.calendar({ version: "v3", auth: auth });
  const mycalendars = await calendarList(calendar);
  const drive = google.drive({ version: 'v3', auth });

  const today = new Date();
  const endDate = new Date(today.getFullYear() + 2, today.getMonth(), today.getDate());

  const myevents = await getEventsFromCalendar(calendar, calendarId, endDate);
  const items = [];

  for (const event of myevents) {
    let shouldInclude = true;
    if (excludeWords.length > 0) {
      shouldInclude = !excludeWords.some(word => event.summary.toLowerCase().includes(word));
    } else if (includeWords.length > 0) {
      shouldInclude = includeWords.some(word => event.summary.toLowerCase().includes(word));
    }
    if (shouldInclude) {
      const start = event.start.dateTime || event.start.date;
      const options = { day: 'numeric', month: 'numeric', year: 'numeric' };
      const formattedDate = new Date(start).toLocaleString('en-US', options);

      await downloadfile(drive,event.description.split('/d/')[1].split('/')[0]);
      
      const savePath = __dirname.replace('tools','') + `html/img/pictures/${event.description.split('/d/')[1].split('/')[0]}.jpg`;
      items.push({ "title": event.summary, "subtitle": "", "arg": `${formattedDate}`, "valid": true, "icon": { "path": savePath } });
      
    }
  }

  return items;
}

(async () => {
module.exports = { getCalendarlist,getEventList };

if (require.main === module) { 
  //await getCalendarlist();
  //console.log(await getCalendarlist('Verjaardagen van familie en vrienden'));
  
  const calendarId = "83f99bd5d8fa15ba20a83ace613ad17c42f93fe5c1f1d11175f5c16e4b68c58f@group.calendar.google.com"
  console.log(await getEventList(calendarId, excludeWords = [], includeWords=[]))
}
})();


// (async () => {
//   try {
//     
//     
//     let folderId ='';
//     const folderName = 'my-folder';

//     // const mycalendars = await calendarList(calendar);
//     // mycalendars.forEach((mycalendar, i) => {
//     //   console.log({nr:i+1,summary:mycalendar.summary,id:mycalendar.id});
//     // });

//     const calendarId = '83f99bd5d8fa15ba20a83ace613ad17c42f93fe5c1f1d11175f5c16e4b68c58f@group.calendar.google.com';

//     // Create a new Google Drive client
//     const drive = google.drive({ version: 'v3', auth });

//     // Search for a folder with a specific name and retrieve its ID
//     // replace with the name of your folder

//     async function upload(drive){
//       const query = `mimeType='application/vnd.google-apps.folder' and trashed=false and name='${folderName}'`;
//       const drivelist = await drive.files.list({
//         q: query,
//         fields: 'files(id)',
//       });

//       if (drivelist.data.files.length === 0) {
//         console.log(`Folder '${folderName}' not found`);
//         const mimeType = 'application/vnd.google-apps.folder';
//         const fileMetadata = {
//           name: folderName,
//           mimeType: mimeType,
//         };
//         const drivecreate = await drive.files.create({
//           requestBody: fileMetadata,
//           fields: 'id',
//         });

//         folderId = drivecreate.data.id;
//         console.log(`Folder ID: ${folderId}`);


//       } else {
//         folderId = drivelist.data.files[0].id;
//         console.log(`Folder ID: ${folderId}`);
//       }

//       // Upload image to Google Drive and add it to the event as an attachment
//       const fileMetadata = {
//         name: 'profile_picture.jpeg', // replace with your image file name
//         parents: [folderId], // replace with the ID of the folder where you want to upload the image
//       };
//       const media = {
//         mimeType: 'image/jpeg', // replace with the MIME type of your image
//         body: fs.createReadStream('/Users/marcotten/Desktop/profile_picture.jpeg'), // replace with the path to your image file
//       };


//       const uploadedFile = await drive.files.create({
//         requestBody: fileMetadata,
//         media: media,
//         fields: 'webViewLink', // retrieve the URL of the uploaded file
//       });

//       return uploadedFile
//     }

//     // const uploadedFile = await upload(drive) 
//     // console.log(uploadedFile.data.webViewLink)

//     async function createEvent(calendar){
//       // Add the image URL to the event as an attachment
//       const event = {
//         summary: 'Marc Birthday' ,
//         start: { date: '1980-01-02' },
//         end: { date: '1980-01-02' },
//         birthday: true,
//         recurrence: [
//           'RRULE:FREQ=YEARLY;BYMONTHDAY=2'
//         ],
//         description: uploadedFile.data.webViewLink // replace with the URL of your uploaded file
//       };
//       const response = await calendar.events.insert({
//         calendarId,
//         resource: event,
//       });
//     }
//     //await createEvent(calendar)

//    

//   } catch (error) {
//     console.error(error);
//   }
// })();






const { google } = require('googleapis');
const { getOAuth2Client } = require('./getOAuth2Client');
const fs = require("fs-extra");
const path = require("path");

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


const downloadfile = async (drive,fileId) => {

  const savePath = __dirname.replace('tools','') + `/html/img/pictures/${fileId}.jpg`;
  if (!fs.existsSync(savePath)) {
  // where to save the image locally
  

  // download the image from Google Drive and save it locally
  drive.files.get({fileId, alt: 'media'}, {responseType: 'stream'}, (err, res) => {
    if (err) return console.log('Error downloading file:', err);

    const dest = fs.createWriteStream(savePath);
    res.data
      .on('error', err => console.log('Error downloading file:', err))
      .on('end', () => console.log('File downloaded successfully.'))
      .pipe(dest);
  });
  }
}

(async () => {
  try {
    const auth = await getOAuth2Client();
    const calendar = await google.calendar({ version: "v3", auth: auth });
    let folderId ='';
    const folderName = 'my-folder';

    // const mycalendars = await calendarList(calendar);
    // mycalendars.forEach((mycalendar, i) => {
    //   console.log({nr:i+1,summary:mycalendar.summary,id:mycalendar.id});
    // });

    const calendarId = '83f99bd5d8fa15ba20a83ace613ad17c42f93fe5c1f1d11175f5c16e4b68c58f@group.calendar.google.com';

    // Create a new Google Drive client
    const drive = google.drive({ version: 'v3', auth });

    // Search for a folder with a specific name and retrieve its ID
    // replace with the name of your folder

    async function upload(drive){
      const query = `mimeType='application/vnd.google-apps.folder' and trashed=false and name='${folderName}'`;
      const drivelist = await drive.files.list({
        q: query,
        fields: 'files(id)',
      });

      if (drivelist.data.files.length === 0) {
        console.log(`Folder '${folderName}' not found`);
        const mimeType = 'application/vnd.google-apps.folder';
        const fileMetadata = {
          name: folderName,
          mimeType: mimeType,
        };
        const drivecreate = await drive.files.create({
          requestBody: fileMetadata,
          fields: 'id',
        });

        folderId = drivecreate.data.id;
        console.log(`Folder ID: ${folderId}`);


      } else {
        folderId = drivelist.data.files[0].id;
        console.log(`Folder ID: ${folderId}`);
      }

      // Upload image to Google Drive and add it to the event as an attachment
      const fileMetadata = {
        name: 'profile_picture.jpeg', // replace with your image file name
        parents: [folderId], // replace with the ID of the folder where you want to upload the image
      };
      const media = {
        mimeType: 'image/jpeg', // replace with the MIME type of your image
        body: fs.createReadStream('/Users/marcotten/Desktop/profile_picture.jpeg'), // replace with the path to your image file
      };


      const uploadedFile = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'webViewLink', // retrieve the URL of the uploaded file
      });

      return uploadedFile
    }

    // const uploadedFile = await upload(drive) 
    // console.log(uploadedFile.data.webViewLink)

    async function createEvent(calendar){
      // Add the image URL to the event as an attachment
      const event = {
        summary: 'Marc Birthday' ,
        start: { date: '1980-01-02' },
        end: { date: '1980-01-02' },
        birthday: true,
        recurrence: [
          'RRULE:FREQ=YEARLY;BYMONTHDAY=2'
        ],
        description: uploadedFile.data.webViewLink // replace with the URL of your uploaded file
      };
      const response = await calendar.events.insert({
        calendarId,
        resource: event,
      });
    }
    //await createEvent(calendar)

    //const endDate = "2023-12-31"; // end date to filter events
    const today = new Date();
    const endDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

    const exclude = [process.argv[2]];
    //console.log(process.argv[2]);

    const myevents = await getEventsFromCalendar(calendar, calendarId, endDate)

    //console.log(`Events from calendar "${calendarId}" between ${new Date().toLocaleDateString()} and ${new Date(endDate).toLocaleDateString()}:`);

    c = 0;
    myevents.forEach( async (event, i) => {
      if (exclude.some(word => event.summary.toLowerCase().includes(word))) {
        // c++;
        const start = event.start.dateTime || event.start.date;
        // console.log(`${c}: \n${event.summary} - ${start}`);
        // console.log(`${event.description}`)
        // console.log(event.description.split('/d/')[1].split('/')[0])

        ///console.log(start)
        const options = { day: 'numeric', month: 'numeric', year: 'numeric' };
        const formattedDate = new Date(start).toLocaleString('en-US', options);

        //console.log(formattedDate)

        await downloadfile(drive,event.description.split('/d/')[1].split('/')[0])
        
        const savePath = __dirname.replace('tools','') + `/html/img/pictures/${event.description.split('/d/')[1].split('/')[0]}.jpg`;
        output = {"items": [ { "title": event.summary, "subtitle": "", "arg": `${formattedDate}`, "valid": true, "icon": { "path": savePath } } ] }
        console.log(JSON.stringify(output,null,2))
        //process.stdout.write(output);
      } else {
        output = {"items": [ { "title": "Not found...", "subtitle": "", "arg": process.argv[2], "valid": true, "icon": { "path": "" } } ] }
        console.log(JSON.stringify(output,null,2))
      }
    });

  } catch (error) {
    console.error(error);
  }
})();


/*
import sys
import os
import json
import datetime

if not sys.argv[1]:

	sys.stdout.write('{"items": [{"title": "No matching items", "subtitle": "Try a different query?", "valid": false, "icon": {"path": "/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertCautionIcon.icns"}}]}')

else:
	#query = {"query": sys.argv[1],"calendarId":os.environ['calendarId']}
	query = {"items": [ { "title": "test_tube", "subtitle": "Input \"🧪\" (test_tube) into foremost application", "arg": "🧪", "valid": True, "icon": { "path": "emojis/test_tube.png" } } ] }

	#print(query)
	sys.stdout.write(json.dumps(query))

*/





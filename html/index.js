const { contextBridge, ipcRenderer } = require('electron');
const global = require('@electron/remote').require('../global');
const dialog = require('@electron/remote').dialog;
const prompt = require('electron-prompt');
const shell = require('electron').shell;

const { google } = require('googleapis');
const { getOAuth2Client } = require('../tools/getOAuth2Client');
const { getEventList, getCalendarlist } = require('../tools/calendar');
const fs = require('fs-extra');
const path = require('path');
const config = require('config');

// function openBrowserIndex() {
//     mylink = "https://calendar.google.com/calendar/u/0/r";
//     const shell = require('electron').shell;
//     shell.openExternal(mylink);
// }

document.addEventListener('DOMContentLoaded', function () {
    // console.log(global.args)
    // document.getElementById('my-div').innerHTML = global.args[2];

    function openBrowserIndex() {
        mylink = 'https://calendar.google.com/calendar/u/0/r';

        shell.openExternal(mylink);
    }

    const getStoredcalendarId = async (credsPath) => {
        const storedCredentialsExist = await fs.exists(credsPath);
        console.log('storedCredentialsExist:' + storedCredentialsExist);
        if (storedCredentialsExist) {
            const storedCredentialsData = await fs.readJson(credsPath);
            return storedCredentialsData;
        }

        process.exit(0);
    };

    const addEvent = async (Name, myDate, myImage) => {
        const auth = await getOAuth2Client();

        mycals = await getCalendarlist();
        var x = document.getElementById('calendars');

        for (const mycal of mycals) {
            //global.selected_workflow_sheets.push(sheet.title);
            //logger(sheet.rowCount);
            var option = document.createElement('option');
            option.text = mycal.summary;
            option.value = mycal.id;
            x.add(option);
        }

        const calendar = await google.calendar({ version: 'v3', auth: auth });

        let credsPath = 'credentials.json';
        const storedCredentials = await getStoredcalendarId(credsPath);

        let calendarId = '';
        if (!storedCredentials.calendarId) {
            x = document.getElementById('calendaridwindow');
            x.className = 'calendaridwindowclass display';

            // prompt({
            //     title: 'Prompt example',
            //     label: 'URL:',
            //     value: 'http://example.org',
            //     inputAttrs: {
            //         type: 'url'
            //     },
            //     type: 'input'
            // })
            // .then((r) => {
            //     if(r === null) {
            //         console.log('user cancelled');
            //     } else {
            //         console.log('result', r);
            //     }
            // })
            // .catch(console.error);

            storedCredentials.calendarId = '';

            fs.outputJsonSync(credsPath, storedCredentials);
            calendarId = '';
        } else {

            // mycals = await getCalendarlist();
            // var x = document.getElementById('calendars');

            // for (const mycal of mycals) {
            //     //global.selected_workflow_sheets.push(sheet.title);
            //     //logger(sheet.rowCount);
            //     var option = document.createElement('option');
            //     option.text = mycal.summary;
            //     option.value = mycal.id;
            //     x.add(option);
            // }

            x = document.getElementById('calendaridwindow');
            x.className = 'calendaridwindowclass nodisplay';
            calendarId = storedCredentials.calendarId;
            
            let myString = global.args[1];
            if (global.args[1] == '.') myString = global.args[2];
            
            console.log('get-event-list',calendarId)
            await ipcRenderer.send('get-event-list', calendarId);

            //myitems = await getEventList(calendarId);
            //console.log(myitems)

        }

        console.log(calendarId);
    };

    addEvent();

    document.getElementById('MacBasefolderLoad').addEventListener('click', function (event) {
        let options = {
            title: 'Custom title bar',
            filters: [
                {
                    name: 'Images',
                    extensions: ['jpg', 'png']
                }
            ],
            properties: ['openFile']
            //properties: ['openDirectory']
        };
        dialog
            .showOpenDialog(options)
            .then((result) => {
                var fieldNameElement = document.getElementById('MacBasefolder');
                fieldNameElement.value = result.filePaths;
            })
            .catch((err) => {
                console.log(err);
            });
    });

    //console.log(getEventList(storedCredentials.calendarId, excludeWords = [], includeWords=[]))

    //document.getElementById('top').innerHTML = "test...."

    // document.getElementById('calendaridbutton').addEventListener('click', function () {
    //     //alert('Hi');
    //     x = document.getElementById('calendaridwindow');
    //     x.className = 'calendaridwindowclass display';
    // });

    document.getElementById('calendaridbutton2').addEventListener('click', function () {
        //alert('Hi');
        x = document.getElementById('calendaridwindow');
        x.className = 'calendaridwindowclass display';
    });

    document.getElementById('closesettings').addEventListener(
        'click',
        function () {
            x = document.getElementById('settingswindow');
            x.className = 'mysettings nodisplay';
        },
        false
    );

    document.getElementById('SaveId').addEventListener(
        'click',
        async function () {
            let credsPath = 'credentials.json';
            const storedCredentials = await getStoredcalendarId(credsPath);

            x = document.getElementById('calendaridwindow');
            x.className = 'calendaridwindowclass nodisplay';

            storedCredentials.calendarId = document.getElementById('calendars').value;

            fs.outputJsonSync(credsPath, storedCredentials);

            javascript: history.go(0);
        },
        false
    );
});


function fitTextWidth(outputSelector) {
    // max font size in pixels
    const maxFontSize = 500;

    //const top = document.getElementById("top");

    // get the DOM output element by its selector
    let outputDiv = document.getElementById(outputSelector);
    // get element's width
    let width = 800;
    // get content's width
    let contentWidth = outputDiv.scrollWidth;
    // get fontSize
    let fontSize = parseInt(window.getComputedStyle(outputDiv, null).getPropertyValue('font-size'), 10);

    //top.innerHTML = fontSize + ' - ' + width + ' - ' + contentWidth;
    // if content's width is bigger than elements width - overflow

    if (contentWidth > width) {
        fontSize = Math.ceil((fontSize * width) / contentWidth, 10);
        fontSize = fontSize > 50 ? (fontSize = 50) : fontSize - 1;
        outputDiv.style.fontSize = fontSize + 'px';
    } else {
        // content is smaller than width... let's resize in 1 px until it fits
        while (contentWidth <= width) {
            fontSize = Math.ceil(fontSize) + 2;
            //fontSize = fontSize > 50 ? fontSize = 50 : fontSize;
            outputDiv.style.fontSize = fontSize + 'px';
            // update widths
            width = outputDiv.clientWidth;
            contentWidth = outputDiv.scrollWidth;

            console.log(width);
            // if (contentWidth > width){
            //     outputDiv.style.fontSize = fontSize-1+'px';
            // }
        }
    }
}

function fitTextHeight(outputSelector) {
    // max font size in pixels
    const maxFontSize = 200;

    //const top = document.getElementById("top");

    // get the DOM output element by its selector
    let outputDiv = document.getElementById(outputSelector);
    // get element's width
    let height = 250;
    // get content's width
    let contentHeight = outputDiv.scrollHeight;
    // get fontSize
    let fontSize = parseInt(window.getComputedStyle(outputDiv, null).getPropertyValue('font-size'), 10);

    //top.innerHTML = fontSize + ' - ' + height + ' - ' + contentHeight;
    // if content's width is bigger than elements width - overflow

    if (contentHeight > height) {
        fontSize = Math.ceil((fontSize * height) / contentHeight, 10);
        fontSize = fontSize > 50 ? (fontSize = 50) : fontSize - 1;
        outputDiv.style.fontSize = fontSize + 'px';
    } else {
        // content is smaller than width... let's resize in 1 px until it fits
        while (contentHeight <= height && height <= 250) {
            fontSize = Math.ceil(fontSize) + 1;
            //fontSize = fontSize > 50 ? fontSize = 50 : fontSize;
            outputDiv.style.fontSize = fontSize + 'px';
            // update widths
            height = outputDiv.clientHeight;
            contentHeight = outputDiv.scrollHeight;

            //console.log(height)
            // if (contentWidth > width){
            //     outputDiv.style.fontSize = fontSize-1+'px';
            // }
        }
    }

    //top.innerHTML += ' --> ' + fontSize + ' - ' + height + ' - ' + contentHeight;
}

ipcRenderer.on('event-list-updated', (event, myitems) => {
    // Do something with myitems
    console.log(myitems)

    if (myitems.length >= 3){

    } 
    
    if (myitems.length >= 2){

    }  
    
    if (myitems.length >= 1) {

        // console.log(myitems[0].icon.path)
        // //./img/pictures/1zrrlqz0YCBCLFaS5_keaEjnDKcyoCRHd.jpg
        // ///Users/marcotten/Documents/projects/hmdu-alfred-workflow//html/img/pictures/1zrrlqz0YCBCLFaS5_keaEjnDKcyoCRHd.jpg
        // 
        // console.log(toreplace);
        // console.log('__dirname',__dirname)
        // console.log(myitems[0].icon.path.replace(toreplace,'./'));
        // console.log('./img/pictures/1zrrlqz0YCBCLFaS5_keaEjnDKcyoCRHd.jpg')

        //document.getElementById("picture").src='../img/pictures/1zrrlqz0YCBCLFaS5_keaEjnDKcyoCRHd.jpg';

        toreplace = global.homedir + '/Documents/projects/hmdu-alfred-workflow/html/'
        var image = new Image();

        console.log(toreplace)

        image.src = myitems[0].icon.path.replace(toreplace,'./');
        image.onload = function() {
            console.log('first',image.src)
            var img = document.getElementById("picture");
            //img.src = image.src;
            img.src = './img/pictures/1zrrlqz0YCBCLFaS5_keaEjnDKcyoCRHd.jpg';
            console.log('second',img.src)
        }

        // var img = document.getElementById("picture");
        // img.onload = function() {
        //     img.src = './img/pictures/1zrrlqz0YCBCLFaS5_keaEjnDKcyoCRHd.jpg';
        // }

        // x = document.getElementById('picture');
        // x.className = 'calendaridwindowclass display';


        //myString += '||' + myString;

        // const parser = new DOMParser();
        // const parsedHtml = parser.parseFromString(myString, 'text/html');
        // 
        // element.innerHTML = parsedHtml.documentElement.innerHTML;

        const element = document.getElementById('centered');
        element.innerHTML = JSON.stringify(myitems[0],null,2);

        fitTextHeight('centered');

        // const top = document.getElementById('top');

        let contentWidth = element.scrollWidth;
        let contentHeight = element.scrollHeight;

        //top.innerHTML += 'contentWidth: ' + contentWidth + ' - contentHeight: ' + contentHeight;

        if (contentWidth >= 800) fitTextWidth('centered');

        document.getElementById('settingsbutton').addEventListener('click', function () {
            //alert('Hi');
            x = document.getElementById('settingswindow');
            x.className = 'mysettings display';
        });

        
    } else {
        console.log('no items..')
    }
});
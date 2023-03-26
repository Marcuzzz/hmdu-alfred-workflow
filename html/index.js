const { contextBridge, ipcRenderer } = require('electron');
const global = require('@electron/remote').require('../global');

const dialog = require('@electron/remote').dialog;

const fs = require('fs');

document.addEventListener('DOMContentLoaded', function () {
    // console.log(global.args)
    // document.getElementById('my-div').innerHTML = global.args[2];

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

    //document.getElementById('top').innerHTML = "test...."

    let myString = global.args[1];
    if (global.args[1] == '.') myString = global.args[2];

    //myString += '||' + myString;

    const parser = new DOMParser();
    const parsedHtml = parser.parseFromString(myString, 'text/html');
    const element = document.getElementById('centered');
    element.innerHTML = parsedHtml.documentElement.innerHTML;
    fitTextHeight('centered');

    const top = document.getElementById('top');

    let contentWidth = element.scrollWidth;
    let contentHeight = element.scrollHeight;

    //top.innerHTML += 'contentWidth: ' + contentWidth + ' - contentHeight: ' + contentHeight;

    if (contentWidth >= 800) fitTextWidth('centered');

    document.getElementById('bottom').addEventListener('click', function () {
        //alert('Hi');
        x = document.getElementById('settingswindow');
        x.className = 'mysettings display';
    });

    document.getElementById('closesettings').addEventListener(
        'click',
        function () {
            x = document.getElementById('settingswindow');
            x.className = 'mysettings nodisplay';
        },
        false
    );
});

//------------------------------------------------------------------------------

// FluidSync
// @fluid_sync_bot
// t.me/fluid_sync_bot
// Use this token to access the HTTP API:
//  396229520:AAEl6G6HrQo8vopDio2PSPZlcNx2Y4KxHEE

//  fluid_sync_game

// https://api.telegram.org/bot<token>/METHOD_NAME

// hurl.it
// https://api.telegram.org/bot396229520:AAEl6G6HrQo8vopDio2PSPZlcNx2Y4KxHEE/setWebhook?url=https://fluidsync.herokuapp.com/396229520:AAEl6G6HrQo8vopDio2PSPZlcNx2Y4KxHEE
// https://api.telegram.org/bot396229520:AAEl6G6HrQo8vopDio2PSPZlcNx2Y4KxHEE/setWebhook?url=https://helpers-nowido.c9users.io/396229520:AAEl6G6HrQo8vopDio2PSPZlcNx2Y4KxHEE

//------------------------------------------------------------------------------

const token = '396229520:AAEl6G6HrQo8vopDio2PSPZlcNx2Y4KxHEE';
const postPathWithToken = '/' + token;
const telegramApiHost = 'https://api.telegram.org/bot' + token + '/';

const fluid_sync_game_short_name = 'fluid_sync_game';
const fluid_sync_game_id = '396229520:AAEl6G6HrQo8vopDio2PSPZlcNx2Y4KxHEEgame';
const fluid_sync_game_url = 'https://fluidsync.herokuapp.com/main.html';
//const fluid_sync_game_path = '/game_assets/main.html';

const url = require('url');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();

//------------------------------------------------------------------------------

var updateId = 0;

const imageFileName = 'sibirnash.jpg';

var imageFileId = undefined;

//------------------------------------------------------------------------------

app.use(bodyParser.json());
app.use(express.static('game_assets'));

//------------------------------------------------------------------------------

app.get('/', (req, res) =>
{
    res.send('Hello World\n');
});

app.post(postPathWithToken, (req, res) => 
{
    res.end();    

    var infoFromTelegram = req.body;
    var callbackQuery = infoFromTelegram.callback_query;
    var inlineQuery = infoFromTelegram.inline_query;

    //console.log(infoFromTelegram);

    if(callbackQuery)
    {
        if(callbackQuery.game_short_name)
        {        
            sendTelegramMethod('answerCallbackQuery', 
            {
                callback_query_id: callbackQuery.id,
                url: fluid_sync_game_url + '?user=' + callbackQuery.from.username
            });            
        }
    }
    else if(inlineQuery)
    {
        var gameObject = 
        {
            type: 'game', 
            id: fluid_sync_game_id, 
            game_short_name: fluid_sync_game_short_name
        };

        sendTelegramMethod('answerInlineQuery', 
        {
            inline_query_id: inlineQuery.id,
            results: [gameObject]
        });
    }
    else if(infoFromTelegram.message)
    {
        react(infoFromTelegram);
    }
});
/*
app.get(fluid_sync_game_path, (req, res) => 
{    
    var f = fs.createReadStream(__dirname + fluid_sync_game_path);        
    f.pipe(res);    
});
*/
app.listen(process.env.PORT, () => 
{
    console.log(`Bot listening on port ${process.env.PORT}!`);
});

//------------------------------------------------------------------------------

function react(updateInfo)
{
    var id = updateInfo.update_id;

    if(id > updateId)
    {
        updateId = id;

        var message = updateInfo.message;    

        if(message)
        {
            replyToMessage(message);
        }
    }
}

//------------------------------------------------------------------------------

function replyToMessage(message)
{
    var text = message.text;
    
    var methodParametersObject = 
    {
        chat_id: message.chat.id
    };
    
    if(text === 'pic')
    {
        if(imageFileId)
        {
            methodParametersObject.photo = imageFileId;
        
            sendTelegramMethod('sendPhoto', methodParametersObject);
        }
        else
        {
            uploadImage(message.chat.id, imageFileName);
        }
    }
    else if(text === 'game')
    {
        methodParametersObject.game_short_name = 'fluid_sync_game';

        sendTelegramMethod('sendGame', methodParametersObject);    
    }
    else
    {
        methodParametersObject.text = 'X3: ' + message.text;

        sendTelegramMethod('sendMessage', methodParametersObject);
    }
}

//------------------------------------------------------------------------------

function sendTelegramMethod(method, methodParameters)
{
    var telegramRequest = 
    {
        url: '/' + method,
        baseUrl: telegramApiHost,
        method: 'POST',
        json: true,
        body: methodParameters
    };    
    
    request(telegramRequest, (err, res, resBody) => 
    {
        if(err)
        {
            console.log('Error while parsing answer from telegram:');    
            console.log(err);    
        }
        else
        {
            if(!resBody.ok)
            {
                console.log('Telegram reports error:');
                console.log(resBody.description);        
            }
        }
    });
}

//------------------------------------------------------------------------------

function uploadImage(chatId, name)
{
    var formData = 
    {
        chat_id: chatId,
        photo: fs.createReadStream(__dirname + '/' + name)
    };
    
    var telegramRequest = 
    {
        url: '/sendPhoto',
        baseUrl: telegramApiHost,
        formData: formData
    };    
    
    request.post(telegramRequest, (err, res, resBody) => 
    {
        if(err)
        {
            console.log(err);    
        }
        else
        {
            try
            {
                var resObject = JSON.parse(resBody);
                
                if(resObject.ok)
                {
                    var photos = resObject.result.photo;
                    
                    var biggestSizeIndex = photos.length - 1;
                    
                    imageFileId = photos[biggestSizeIndex].file_id;
                }
            }
            catch(e)
            {
                console.log(e);    
            }
        }
    });
}

//------------------------------------------------------------------------------

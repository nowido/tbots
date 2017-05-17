//------------------------------------------------------------------------------

// FluidSync
// @fluid_sync_bot
// t.me/fluid_sync_bot
// Use this token to access the HTTP API:
//  396229520:AAEl6G6HrQo8vopDio2PSPZlcNx2Y4KxHEE

// https://api.telegram.org/bot<token>/METHOD_NAME

// https://fluidsync.herokuapp.com/

//------------------------------------------------------------------------------

const token = '396229520:AAEl6G6HrQo8vopDio2PSPZlcNx2Y4KxHEE';
const postPathWithToken = '/' + token;
const telegramApiHost = 'api.telegram.org';
const telegramApiPathWithToken = '/bot' + token + '/';

const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

//------------------------------------------------------------------------------


//------------------------------------------------------------------------------

var updateId = 0;

//------------------------------------------------------------------------------

app.use(bodyParser.json());

app.get('/', (req, res) =>
{
    res.send('Hello World\n');
});

app.post(postPathWithToken, (req, res) => 
{
    res.end();

    react(req.body);
});

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
    var methodParametersObject = 
    {
        chat_id: message.chat.id,
        text: 'X3: ' + message.text
    };

    sendTelegramMethod('sendMessage', methodParametersObject);
}

//------------------------------------------------------------------------------

function sendTelegramMethod(method, methodParameters)
{
    var telegramRequest = 
    {
        hostname: telegramApiHost,
        path: telegramApiPathWithToken + method,
        port: 443,
        method: 'POST'
    };    
    
    const req = https.request(telegramRequest, (res) => 
    {
        var body = '';
        
        res.setEncoding('utf8');
        
        res.on('data', (data) => 
        {
            body += data;
        });        
        
        res.on('end', () => 
        {
            getTelegramMethodResult(body);
        });
    });    
    
    req.on('error', (e) => 
    {
        console.log(e);
    });
    
    const jsonString = JSON.stringify(methodParameters);

    req.setHeader('Content-Type', 'application/json');
    req.write(jsonString);

    req.end();    
}

//------------------------------------------------------------------------------

function getTelegramMethodResult(body)
{
    try
    {
        const resObject = JSON.parse(body);    
        
        if(!resObject.ok)
        {
            console.log('Telegram reports error:');
            console.log(resObject.description);        
        }
    }
    catch(e)
    {
        console.log('Error while parsing answer from telegram:');    
        console.log(e);    
    }
}

//------------------------------------------------------------------------------

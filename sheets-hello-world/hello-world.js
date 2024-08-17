const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Load the credentials file
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

async function authorize() {
    const { client_secret, client_id, redirect_uris } = JSON.parse(fs.readFileSync(CREDENTIALS_PATH)).installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    if (fs.existsSync(TOKEN_PATH)) {
        oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH)));
    } else {
        // Get a new token and save it for future use
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const { code } = await new Promise(resolve => {
            // Use a library like readline to capture the authorization code from the command line
            // resolve with the code once received
        });
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    }
    return oAuth2Client;
}

async function readCell() {
    const auth = await authorize();
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = 'YOUR_SPREADSHEET_ID';
    const range = 'Sheet1!A1';  // Adjust the sheet name and cell reference as needed

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });

    const cellValue = response.data.values ? response.data.values[0][0] : 'No data found';
    console.log('Cell value:', cellValue);
}

readCell().catch(console.error);

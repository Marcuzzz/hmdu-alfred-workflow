const { OAuth2Client } = require("google-auth-library");
const http = require("http");
const url = require("url");
const destroyer = require("server-destroy");
const fs = require("fs-extra");
const path = require("path");
const config = require("config");
const open = require("open");

const getStoredCredentials = async (credsPath) => {
  const storedCredentialsExist = await fs.exists(credsPath);
  //console.log('storedCredentialsExist:' + storedCredentialsExist)
  if (storedCredentialsExist) {
    const storedCredentialsData = await fs.readJson(credsPath);
    if (storedCredentialsData.refresh_token) {
      //console.log('refresh token: ' + storedCredentialsData.refresh_token)
      return storedCredentialsData;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

module.exports.getOAuth2Client = async (options) => {
  return new Promise(async (resolve) => {
    
    let credsPath = "./credentials.json";
    let secret = config.get("web");

    const oAuth2Client = new OAuth2Client({
      clientId: secret.client_id,
      clientSecret: secret.client_secret,
      redirectUri: secret.redirect_uris[0],
    });

    const storedCredentials = await getStoredCredentials(credsPath);

    if (storedCredentials) {
      oAuth2Client.setCredentials(storedCredentials);

      var tokenInfo = false;
      try {
        tokenInfo = await oAuth2Client.getTokenInfo(
          storedCredentials.access_token
        );
      } catch (err) {}

      if (!tokenInfo) {
        console.log("using old access code, failed");
        //const tokens = await oAuth2Client.refreshAccessToken()
        const tokens = await oAuth2Client.refreshToken(
          storedCredentials.refresh_token
        );
        tokens.res.data["refresh_token"] = storedCredentials.refresh_token;
        fs.outputJsonSync(credsPath, tokens.res.data);
        //process.exit(0);
        return resolve(oAuth2Client);
      } else {
        //console.log("using old access code, succeeded");
        //process.exit(0);
        return resolve(oAuth2Client);
      }
    }

    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/calendar","https://www.googleapis.com/auth/drive"],
      prompt: 'consent'
    });

    const server = http
      .createServer(async (req, res) => {
        try {
          if (req.url.indexOf("/") > -1) {
            const qs = new url.URL(req.url, "http://localhost").searchParams;
            const code = qs.get("code");
            res.end("Authentication successful! Please return to the console.");
            server.destroy();
            const r = await oAuth2Client.getToken(code);
            oAuth2Client.setCredentials(r.tokens);
            fs.outputJsonSync(credsPath, r.tokens);
            resolve(oAuth2Client);
          }
        } catch (e) {
          reject(e);
        }
      })
      .listen(80, () => {
        //console.log(authorizeUrl);
        open(authorizeUrl, { wait: false }).then((cp) => cp.unref());
      });
    destroyer(server);
  });
};

// getOAuth2Client();

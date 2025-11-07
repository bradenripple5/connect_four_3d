const http = require('http');
const url = require('url');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
  || '549464298563-1dpt98e2nfobnnboqng7lbcmj5ujmomc.apps.googleusercontent.com';
const APP_JWT_SECRET = process.env.APP_JWT_SECRET || 'dev-secret-change-me';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// simple CORS
function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // dev only
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = ''; req.on('data', c => data += c);
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch(e){ reject(e);} });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const { pathname } = url.parse(req.url, true);

  if (req.method === 'OPTIONS') {
    cors(res);
    res.writeHead(200); res.end(); return;
  }

  if (req.method === 'POST' && pathname === '/auth/google') {
    try {
      cors(res);
      const { id_token } = await readJson(req);
      if (!id_token) throw new Error('Missing id_token');

      const ticket = await googleClient.verifyIdToken({
        idToken: id_token,
        audience: GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      if (!payload.email_verified) throw new Error('Email not verified by Google');

      const user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      };

      const appToken = jwt.sign(user, APP_JWT_SECRET, { expiresIn: '7d' });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, user, token: appToken }));
      return;
    } catch (err) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
      return;
    }
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, World!\n');
});

server.listen(3000, () => console.log('Server on http://localhost:3000'));

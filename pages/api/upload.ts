import type { NextApiRequest, NextApiResponse } from 'next';
import { Dropbox } from 'dropbox';
import fetch from 'isomorphic-fetch';
import File from './lib/fileUpload';
import connectToDatabase from './lib/mongodb';
import Token from './lib/tokenModel';

// Create a custom body parser with increased limit
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { file, filename, mimetype } = req.body;

    if (!file || !filename || !mimetype) {
      return res.status(400).json({ error: 'File, filename, and mimetype are required' });
    }

    try {
      await connectToDatabase();
      console.log('Connected to MongoDB');

      let tokenData = await Token.findOne();
      if (!tokenData) {
        const newTokenData = await getNewToken();
        if (!newTokenData.success) {
          console.error('Error fetching new token:', newTokenData.message);
          return res.status(500).json({ error: 'Failed to get new access token' });
        }
        tokenData = newTokenData.token;
      }

      const { access_token, refresh_token, expires_at } = tokenData;

      const currentTime = new Date().getTime();

      let accessToken = access_token;
      if (currentTime >= expires_at) {
        console.log('refreshTokenResult');
        const refreshTokenResult = await refreshTokenFunction(refresh_token);
        if (!refreshTokenResult.success) {
          console.error('Error refreshing token:', refreshTokenResult.message);
          return res.status(500).json({ error: refreshTokenResult.message });
        }
        accessToken = refreshTokenResult.access_token;
      }

      const dbx = new Dropbox({ accessToken, fetch });
      const dropboxResponse = await dbx.filesUpload({
        path: `/${filename}`,
        contents: Buffer.from(file, 'base64'),
      });

      const sharedLinkResponse = await dbx.sharingCreateSharedLinkWithSettings({
        path: dropboxResponse.result.path_display || '',
        settings: {
          requested_visibility: { '.tag': 'public' },
        },
      });

      const fileUrl = sharedLinkResponse.result.url.replace('dl=0', 'raw=1');

      const fileData = {
        filename,
        url: fileUrl,
        mimetype,
        created_at: new Date(),
      };

      await File.create(fileData);
      res.status(200).json({ message: 'File uploaded and saved successfully', file: dropboxResponse });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Upload failed', details: error });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

// Increase the request body size limit
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Set to desired limit
    },
  },
};

const refreshTokenFunction = async (refreshToken: string) => {
  try {
    const refreshTokenResponse = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.DROPBOX_APP_KEY!,
        client_secret: process.env.DROPBOX_APP_SECRET!,
      }),
    });

    const tokenResponseData = await refreshTokenResponse.json();
    if (!tokenResponseData.access_token) {
      console.error('Failed to refresh token:', tokenResponseData);
      return { success: false, message: 'Token refresh failed: ' + tokenResponseData.error_description };
    }
    console.log('refreshTokenFunction');
    const expiresAt = new Date().getTime() + tokenResponseData.expires_in * 1000;

    await Token.findOneAndUpdate(
      {},
      { access_token: tokenResponseData.access_token, expires_at: expiresAt },
      { new: true }
    );

    return { success: true, access_token: tokenResponseData.access_token };
  } catch (error) {
    console.error('Error during token refresh:', error);
    return { success: false, message: 'Token refresh failed' };
  }
};

const getNewToken = async () => {
  try {
    const authCode = process.env.DROPBOX_AUTH_CODE!;
    // console.log('Using auth code:', authCode); // REMOVED FOR SECURITY
    // console.log('Using auth code:', process.env.DROPBOX_APP_KEY); // REMOVED FOR SECURITY
    // console.log('Using auth code:', process.env.DROPBOX_APP_SECRET); // REMOVED FOR SECURITY
    // console.log('Using auth code:', process.env.DROPBOX_REDIRECT_URI); // REMOVED FOR SECURITY

    const newTokenResponse = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: authCode,
        client_id: process.env.DROPBOX_APP_KEY!,
        client_secret: process.env.DROPBOX_APP_SECRET!,
        redirect_uri: process.env.DROPBOX_REDIRECT_URI!,
      }),
    });

    const tokenData = await newTokenResponse.json();
    if (!tokenData.access_token) {
      console.error('Failed to get new token:', tokenData);
      return { success: false, message: 'Failed to get new access token: ' + tokenData.error_description };
    }

    const expiresAt = new Date().getTime() + tokenData.expires_in * 1000;

    const newToken = new Token({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt,
    });

    await newToken.save();
    return { success: true, token: newToken };
  } catch (error) {
    console.error('Error getting new token:', error);
    return { success: false, message: 'Failed to get new access token' };
  }
};

export default handler;

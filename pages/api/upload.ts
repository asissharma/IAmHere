import type { NextApiRequest, NextApiResponse } from 'next';
import { Dropbox } from 'dropbox';
import fetch from 'isomorphic-fetch';
import File from './lib/fileUpload'; // Import the File model
import connectToDatabase from './lib/mongodb'; // MongoDB connection function
import Token from './lib/tokenModel'; // Import the token model

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { file, filename, mimetype } = req.body;

    if (!file || !filename || !mimetype) {
      return res.status(400).json({ error: 'File, filename, and mimetype are required' });
    }

    try {
      // Connect to MongoDB
      await connectToDatabase();

      // Fetch the stored access token and refresh token from MongoDB
      let tokenData = await Token.findOne();

      if (!tokenData) {
        // No token found, need to create a new token entry
        const newTokenData = await getNewToken();
        if (!newTokenData.success) {
          return res.status(500).json({ error: 'Failed to get new access token' });
        }
        tokenData = newTokenData.token;
      }

      const { access_token, refresh_token, expires_at } = tokenData;
      const currentTime = new Date().getTime();

      let accessToken = access_token;

      // Check if token has expired
      if (currentTime >= expires_at) {
        console.log('Access token expired, refreshing...');

        const refreshTokenResult = await refreshTokenFunction(refresh_token);

        if (!refreshTokenResult.success) {
          return res.status(500).json({ error: refreshTokenResult.message });
        }

        accessToken = refreshTokenResult.access_token;
      }

      // Initialize Dropbox instance with current access token
      let dbx = new Dropbox({ accessToken, fetch });

      // Upload the file to Dropbox
      const dropboxResponse = await dbx.filesUpload({
        path: `/${filename}`,
        contents: Buffer.from(file, 'base64'),
      });

      // Create a shared link for the uploaded file
      const sharedLinkResponse = await dbx.sharingCreateSharedLinkWithSettings({
        path: dropboxResponse.result.path_display || '',
        settings: {
          requested_visibility: { '.tag': 'public' },
        },
      });

      // Adjust URL for direct access
      const fileUrl = sharedLinkResponse.result.url.replace('dl=0', 'raw=1');

      // Save file metadata to MongoDB
      const fileData = {
        filename,
        url: fileUrl,
        mimetype,
        created_at: new Date(),
      };

      await File.create(fileData); // Save file data to MongoDB

      res.status(200).json({ message: 'File uploaded and saved successfully', file: dropboxResponse });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

export default handler;

// Function to refresh the access token
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
    console.log(tokenResponseData);
    if (!refreshTokenResponse.ok) {
      console.error('Error refreshing access token:', tokenResponseData);
      return { success: false, message: 'Failed to refresh access token' };
    }

    // Calculate new expiration time (assuming expires_in is in seconds)
    const expiresAt = new Date().getTime() + tokenResponseData.expires_in * 1000;

    // Update token in MongoDB
    await Token.findOneAndUpdate(
      {},
      { access_token: tokenResponseData.access_token, expires_at: expiresAt },
      { new: true }
    );

    return { success: true, access_token: tokenResponseData.access_token };
  } catch (error) {
    console.error('Error refreshing token:', error);
    return { success: false, message: 'Token refresh failed' };
  }
};

// Function to get a new access token and create the token entry in MongoDB
const getNewToken = async () => {
  try {
    const authCode = process.env.DROPBOX_AUTH_CODE!;

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
    console.log(tokenData);

    if (!newTokenResponse.ok) {
      console.error('Error fetching new token:', tokenData);
      return { success: false, message: 'Failed to fetch new access token' };
    }

    // Calculate expiration time
    const expiresAt = new Date().getTime() + tokenData.expires_in * 1000;

    // Save the token in MongoDB
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
  
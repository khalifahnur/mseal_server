import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const sk = process.env.TICKET_SECRET_KEY;

if (!sk) {
  throw new Error('TICKET_SECRET_KEY is not defined in environment variables');
}

const secretKey = crypto.createHash('sha256').update(sk).digest();

function encryptQr(data:any) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', secretKey, iv);

  const jsonData = JSON.stringify(data);
  const encrypted = Buffer.concat([
    cipher.update(jsonData, 'utf8'),
    cipher.final()
  ]);

  const authTag = cipher.getAuthTag();

  const payload = {
    iv: iv.toString('base64'),
    encryptedData: encrypted.toString('base64'),
    authTag: authTag.toString('base64')
  };

  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

module.exports = encryptQr;

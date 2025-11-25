import { SignJWT } from 'jose';

export const generateAuthToken = async (email: string = 'user@example.com'): Promise<string> => {
  const secret = process.env.REACT_APP_AUTH_SECRET || 'togglePOC';

  try {
    const secretKey = new TextEncoder().encode(secret);

    const jwt = await new SignJWT({
      user: { email: email },
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secretKey);

    return jwt;
  } catch (error) {
    console.error('Failed to generate JWT token:', error);
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSJ9LCJpYXQiOjE3NjQwNzc2OTUsImV4cCI6MTc2NDE2NDA5NX0.er4H4XqRhEgJOF3axEYBaR5yvD0Z36UeP1aRDBRZhGI';
  }
};

export const getAuthToken = async (): Promise<string> => {
  const envToken = process.env.REACT_APP_AUTH_TOKEN;
  if (envToken && envToken.trim()) {
    return envToken.startsWith('Bearer ') ? envToken : `Bearer ${envToken}`;
  }

  const token = await generateAuthToken();
  return `Bearer ${token}`;
};

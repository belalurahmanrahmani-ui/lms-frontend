type JwtPayload = {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
  exp: number;
};

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const payloadBase64 = token.split(".")[1];
    const json = Buffer.from(payloadBase64, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}
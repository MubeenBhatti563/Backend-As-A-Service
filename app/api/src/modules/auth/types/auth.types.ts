export type AccessTokenType = {
  sub: string;
  email: string;
  type: 'accessToken';
};
export type RefreshTokenType = {
  sub: string;
  email: string;
  type: 'refreshToken';
};

export type JwtPayload = AccessTokenType | RefreshTokenType;

export interface SessionDeviceType {
  ipAddress?: String;
  userAgent?: String;
  deviceName?: String;
  clientType?: String;
}

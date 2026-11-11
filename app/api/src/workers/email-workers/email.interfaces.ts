export interface SendVerificationEmailPayload {
  email: string;
  token: string;
}

export interface SendPasswordResetEmailPayload {
  email: string;
  token: string;
}

export interface SendAccountDeletedEmailPayload {
  email: string;
}

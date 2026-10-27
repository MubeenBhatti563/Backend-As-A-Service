// Load the plugin at runtime in `main.ts` and expose its decorated members to
// every Fastify request/reply type in the application.
import '@fastify/cookie';

declare module 'fastify' {
  interface FastifyRequest {
    cookies: Record<string, string | undefined>;
  }

  interface FastifyReply {
    setCookie(
      name: string,
      value: string,
      options?: {
        domain?: string;
        expires?: Date;
        httpOnly?: boolean;
        maxAge?: number;
        path?: string;
        sameSite?: 'lax' | 'none' | 'strict' | boolean;
        secure?: boolean | 'auto';
        signed?: boolean;
      },
    ): this;
  }
}

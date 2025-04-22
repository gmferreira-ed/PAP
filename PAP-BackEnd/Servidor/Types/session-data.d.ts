import "express-session";

// Quaisquer dados que sao guardados na sessao, devem ter o seu tipo declarado aqui

declare module "express-session" {
  interface SessionData {
    user: string;
  }
}

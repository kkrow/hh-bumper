import { existsSync } from "node:fs";

interface TokenStorage {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
}

const TOKEN_FILE = "tokens.json";

export const tokenStorage = {
  load: async (): Promise<TokenStorage | null> => {
    if (!existsSync(TOKEN_FILE)) return null;
    try {
      const data = Bun.file(TOKEN_FILE).text();
      return JSON.parse(await data) as TokenStorage;
    } catch {
      return null;
    }
  },

  save: async (tokens: TokenStorage) => {
    await Bun.write(TOKEN_FILE, JSON.stringify(tokens, null, 2));
    console.log("✅ Токены сохранены в", TOKEN_FILE);
  },

  accessToken: async (): Promise<string> => {
    const tokens = await tokenStorage.load();
    return tokens?.access_token || "";
  },

  refreshToken: async (): Promise<string> => {
    const tokens = await tokenStorage.load();
    return tokens?.refresh_token || "";
  },
};

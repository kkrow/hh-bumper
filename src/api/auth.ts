import { tokenStorage } from "@storage/token-storage";
import * as crypto from "node:crypto";
import { authorize } from "./orval/api";
import type { AuthUserToken } from "./orval/api.schemas";
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;

const state = crypto.randomBytes(64).toString("hex");
const authUrl = `https://hh.ru/oauth/authorize?
  response_type=code&
  client_id=${CLIENT_ID}&
  client_secret=${CLIENT_SECRET}&
  state=${state}&
  redirect_uri=${REDIRECT_URI}`;

export const auth = {
  // Запуск веб-сервера для получения кода авторизации
  startAuthServer: async () => {
    const server = Bun.serve({
      port: 52888,
      async fetch(req) {
        const url = new URL(req.url);

        // Обработка redirect от hh.ru
        if (url.pathname === "/auth") {
          const code = url.searchParams.get("code");
          const receivedState = url.searchParams.get("state");
          if (!code || receivedState !== state) {
            return new Response("Ошибка: некорректный запрос", { status: 400 });
          }

          // Обмен кода на токены
          const tokens = await auth.exchangeCodeForTokens(code);

          if (tokens) {
            console.log("\n✅ Авторизация прошла успешно!");
            await tokenStorage.save(tokens);
            server.stop();
            return new Response("Авторизация успешна! Окно можно закрыть.", {
              headers: { "Content-Type": "text/html; charset=utf-8" },
            });
          }

          return new Response("Ошибка обмена кода на токены", {
            status: 500,
          });
        }

        return new Response("Не найдено", { status: 404 });
      },
    });

    console.log(
      `\n🔐 Откройте эту ссылку в браузере для авторизации:\n${authUrl.replace(/\n| /g, "")}\n`,
    );
    console.log(`Сервер запущен на http://${server.hostname}:${server.port}`);
  },

  // Обмен authorization_code на access_token
  exchangeCodeForTokens: async (code: string) => {
    try {
      if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
        console.error("❌ Не заданы переменные окружения");
        return null;
      }
      const response = await authorize({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      });

      const tokens = response.data as AuthUserToken;
      await tokenStorage.save(tokens);

      console.log("✅ Токен получен успешно");
      return tokens;
    } catch (error) {
      console.error("Ошибка при обмене кода:", error);
      return null;
    }
  },

  // Обновление токена
  refreshAccessToken: async () => {
    try {
      const refreshToken = await tokenStorage.refreshToken();
      if (!refreshToken) {
        console.error("❌ Refresh-токен не найден, пройдите авторизацию");
        return null;
      }
      const response = await authorize({
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      });

      const tokens = response.data as AuthUserToken;
      await tokenStorage.save(tokens);

      console.log("✅ Токен успешно обновлён");
      return tokens;
    } catch (error) {
      console.error("Ошибка при обновлении токена:", error);
      return null;
    }
  },

  checkTokens: async () => {
    const accessToken = await tokenStorage.accessToken();
    const refreshToken = await tokenStorage.refreshToken();
    if (!accessToken || !refreshToken) {
      console.error("❌ Токены не найдены, пройдите авторизацию");
      return false;
    }
    console.log("✅ Токены на месте");
    return true;
  },
};

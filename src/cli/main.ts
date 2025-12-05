import { commands } from "./commands";
import { auth } from "@api/auth";

const usage = `
Использование:
  bun run index.ts auth      - Запустить авторизацию
  bun run index.ts list      - Показать список резюме
  bun run index.ts publish   - Поднять все резюме
  bun run index.ts daemon    - Запустить в режиме демона
`;

export async function runCli() {
  const command = process.argv[2];

  if (command !== "auth") {
    if (!auth.checkTokens()) {
      console.log("Выполните: bun run index.ts auth");
      return;
    }
  }

  switch (command) {
    case "auth":
      await commands.auth();
      break;
    case "list":
      await commands.list();
      break;
    case "publish":
      await commands.publish();
      break;
    case "daemon":
      await commands.daemon();
      break;
    default:
      console.log(usage);
  }
}

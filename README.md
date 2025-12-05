# hh-bumper

Авто-поднятие резюме на hh.ru через их API. Скрипт поднимает все ваши резюме с учётом тайм-аутов, а также может работать в режиме демона.

## Предварительные требования

- Bun v1.3.3+ (`curl https://bun.sh/install | bash`)
- Аккаунт hh.ru и зарегистрированное OAuth-приложение (https://dev.hh.ru/admin)
- Переменные окружения в `.env` (создайте по примеру `.env.example`):
  - `CLIENT_ID`
  - `CLIENT_SECRET`
  - `REDIRECT_URI` — должен совпадать с тем, что указано в настройках OAuth (например, `http://localhost:52888/auth`)
  - `USER_AGENT`

Установка зависимостей:

```bash
bun install
```

## Использование

1. Авторизация и получение токенов

```bash
bun run index.ts auth
```

Скрипт выведет ссылку; откройте её в браузере и разрешите доступ. После успешной авторизации появится сообщение, токены сохранятся в `tokens.json`.

2. Просмотр ваших резюме

```bash
bun run index.ts list
```

3. Поднять все резюме один раз, ожидая их время поднятия

```bash
bun run index.ts publish
```

4. Запуск в режиме демона (цикл поднятия)

```bash
bun run index.ts daemon
```

Процесс будет бесконечно повторять публикацию по расписанию каждого резюме. Остановить вручную можно используя `Ctrl+C`.

## Использование готового Docker-образа

1. Получить токены и/или подготовить `.env` локально:

```bash
CLIENT_ID=... CLIENT_SECRET=... REDIRECT_URI=http://localhost:52888/auth
# авторизоваться можно локально: bun run index.ts auth
# после авторизации появится tokens.json
```

2. Создать файл `docker-compose.yml`:

```
services:
  hh-bumper:
    image: kkrow/hh-bumper:latest
    container_name: hh-bumper
    restart: unless-stopped
    ports:
      - "52888:52888"
    env_file:
      - ./.env
    volumes:
      - ./tokens.json:/app/tokens.json

```

3. Запустить контейнер:

```
docker-compose up -d
```

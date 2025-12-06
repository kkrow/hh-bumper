import { auth } from "@api/auth";
import type {
  ResumesMineItem,
  ResumesMineResponse,
} from "@api/orval/api.schemas";
import { resumesApi } from "@api/resumes";
import { tokenStorage } from "@storage/token-storage";
import { getDelayUntilPublish, sleep } from "@utils/time";

export const resumesService = {
  // Получение списка резюме
  getMine: async (): Promise<ResumesMineResponse | null> => {
    const accessToken = await tokenStorage.accessToken();
    if (!accessToken) {
      console.error("Нет access token");
      return null;
    }

    try {
      const response = await resumesApi.list();

      if (response.status === 403) {
        console.log("Токен истёк, обновляем...");
        await auth.refreshAccessToken();
        return resumesService.getMine(); // Повторная попытка
      }

      console.log(`📄 Найдено ${response.data.found || 0} резюме`);
      return response.data;
    } catch (error) {
      console.error("Ошибка получения резюме:", error);
      return null;
    }
  },

  // Поднятие резюме
  publish: async (resume: ResumesMineItem): Promise<boolean | null> => {
    const { delay, hours, minutes, canPublishAt } = getDelayUntilPublish(
      resume.updated_at,
    );
    if (delay > 0) {
      console.log(
        `⏳ Резюме ${resume.title}: ожидаем ${hours}ч ${minutes}мин до поднятия
⏰ Следующее поднятие ${canPublishAt.toLocaleString("ru")}`,
      );

      await sleep(delay);
    } else {
      console.log(`✅ Резюме ${resume.title}: готово к поднятию`);
    }

    const accessToken = await tokenStorage.accessToken();
    if (!accessToken) {
      console.error("Нет access token");
      return null;
    }

    try {
      const response = await resumesApi.publish(resume.id);

      if (response.status === 204) {
        console.log(`✅ Резюме ${resume.title} успешно поднято`);
        return true;
      }

      if (response.status === 429) {
        console.log(
          `⏳ Ошибка при поднятии резюме ${resume.title}
${JSON.stringify(response.data.errors)}`,
        );
        return false;
      }

      if (response.status === 403) {
        console.log("Токен истёк, обновляем...");
        await auth.refreshAccessToken();
        return resumesService.publish(resume); // Повторная попытка
      }

      const error = response.data?.errors;
      console.error(`Ошибка при поднятии резюме ${resume.title}:`, error);
      return false;
    } catch (error) {
      console.error("Ошибка при поднятии резюме:", error);
      return false;
    }
  },

  // Поднятие всех резюме
  publishAll: async () => {
    const data = await resumesService.getMine();

    if (!data || !data.items) {
      console.error("Резюме не найдены");
      return;
    }

    console.log(`🚀 Планируем поднятие ${data.items.length} резюме...\n`);

    // Все резюме публикуются параллельно, каждое со своей задержкой
    const results = await Promise.all(
      data.items.map((resume) => resumesService.publish(resume)),
    );

    console.log("\n✅ Все резюме обработаны!");
    return results;
  },

  // Запуск демона для автоматического поднятия резюме
  startDaemon: async () => {
    console.log("✅ Демон запущен!");
    while (true) {
      await resumesService.publishAll();
    }
  },
};

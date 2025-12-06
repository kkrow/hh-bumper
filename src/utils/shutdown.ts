/**
 * Настройка graceful shutdown для приложения
 * Обрабатывает SIGTERM и SIGINT сигналы для корректного завершения работы
 * @returns Объект с AbortSignal и функцией проверки флага завершения
 */
export function setupGracefulShutdown(): {
  abortSignal: AbortSignal;
  checkShouldStop: () => boolean;
} {
  const abortController = new AbortController();
  const abortSignal = abortController.signal;
  let shouldStop = false;

  // Функция для проверки флага завершения
  const checkShouldStop = () => shouldStop;

  // Обработка сигналов для graceful shutdown (once - чтобы обработчик вызывался только один раз)
  const shutdown = (signal: string) => {
    if (shouldStop) return; // Предотвращаем повторные вызовы
    console.log(`\n📥 Получен сигнал ${signal}, завершаем работу...`);
    shouldStop = true;
    abortController.abort(); // Отменяем все активные операции
  };

  process.once("SIGTERM", () => shutdown("SIGTERM"));
  process.once("SIGINT", () => shutdown("SIGINT"));

  return {
    abortSignal,
    checkShouldStop,
  };
}

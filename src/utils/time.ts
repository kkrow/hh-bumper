type DelayInfo = {
  delay: number;
  hours: number;
  minutes: number;
  canPublishAt: Date;
};

// Вычисляет задержку до возможности поднятия резюме
export const getDelayUntilPublish = (updatedAt: string): DelayInfo => {
  const updated = new Date(updatedAt);
  const canPublishAt = new Date(updated.getTime() + 4 * 60 * 60 * 1000 + 1000); // +4 часа и одна секунда
  const now = new Date();

  const delay = canPublishAt.getTime() - now.getTime();

  const hours = Math.floor(delay / (1000 * 60 * 60));
  const minutes = Math.floor((delay % (1000 * 60 * 60)) / (1000 * 60));

  return { delay: delay > 0 ? delay : 0, hours, minutes, canPublishAt };
};

// Ожидание с таймером (с возможностью прерывания)
export const sleep = (ms: number, abortSignal?: AbortSignal): Promise<void> => {
  return new Promise((resolve) => {
    if (ms <= 0) {
      resolve();
      return;
    }

    // Если сигнал уже отменен, сразу завершаем
    if (abortSignal?.aborted) {
      resolve();
      return;
    }

    const timeoutId = setTimeout(() => {
      resolve();
    }, ms);

    // Если передан AbortSignal, слушаем его отмену
    if (abortSignal) {
      abortSignal.addEventListener("abort", () => {
        clearTimeout(timeoutId);
        resolve();
      });
    }
  });
};

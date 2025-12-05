// Вычисляет задержку до возможности поднятия резюме
export const getDelayUntilPublish = (updatedAt: string): number => {
  const updated = new Date(updatedAt);
  const canPublishAt = new Date(updated.getTime() + 4 * 60 * 60 * 1000); // +4 часа
  const now = new Date();

  const delay = canPublishAt.getTime() - now.getTime();

  return delay > 0 ? delay : 0;
};

// Ожидание с таймером
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

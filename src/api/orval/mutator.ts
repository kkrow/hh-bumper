import { tokenStorage } from "@storage/token-storage";

const userAgent = process.env.USER_AGENT || "";

export const customFetch = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const accessToken = await tokenStorage.accessToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      "User-Agent": userAgent,
      Authorization: `Bearer ${accessToken}`,
      ...options?.headers,
    },
  });

  // Для методов без body (204 No Content)
  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    return {} as T;
  }
  // @ts-expect-error need to fix
  return { data: await response.json(), status: response.status };
};

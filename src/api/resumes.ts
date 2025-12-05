import { getMineResumes, publishResume } from "./orval/api";
import type { ResumesMineResponse } from "./orval/api.schemas";

export const resumesApi = {
  list: () => getMineResumes(),
  publish: (resumeId: string) => publishResume(resumeId),
  mapMineResponse: (response: Awaited<ReturnType<typeof getMineResumes>>) =>
    response.data as ResumesMineResponse,
};

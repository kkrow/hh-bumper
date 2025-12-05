import { auth } from "@api/auth";
import { resumesService } from "@services/resumes-service";

export const commands = {
  auth: async () => {
    await auth.startAuthServer();
  },

  list: async () => {
    const data = await resumesService.getMine();
    console.log(JSON.stringify(data, null, 2));
  },

  publish: async () => {
    await resumesService.publishAll();
  },

  daemon: async () => {
    await resumesService.startDaemon();
  },
};

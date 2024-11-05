import { FormData, File } from "formdata-node";
import { fileFromPath } from "formdata-node/file-from-path";
import { config } from "../config";

export async function uploadJS(script: any, payloadName: string, uuid: string) {
  const form = new FormData();
  form.set("file", new File([script], payloadName));
  console.log(config.PSK);
  console.log(form);
  await fetch(config.NEBULA_URL + "api/upload-asset", {
    headers: {
      PSK: config.PSK,
      packagename: uuid
    },
    method: "post",
    body: form
  });
}

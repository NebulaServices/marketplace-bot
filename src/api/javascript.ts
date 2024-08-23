import { FormData, File } from "formdata-node";
import { fileFromPath } from "formdata-node/file-from-path";
import { config } from "../config";

export function upload_javascript(script: any, name: string) {
  const form = new FormData();
  form.set("file", new File([script], name));

  console.log(config.PSK);
  console.log(form);
  fetch(config.NEBULA_URL + "api/upload-script", {
    headers: {
      PSK: config.PSK,
    },
    method: "post",
    body: form,
  });
}

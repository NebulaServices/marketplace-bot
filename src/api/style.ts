import { FormData, File } from "formdata-node";
import { fileFromPath } from "formdata-node/file-from-path";
import { config } from "../config";

export function upload_style(style: any, name: string) {
  const form = new FormData();
  form.set("file", new File([style], name));

  console.log(config.PSK);
  console.log(form);
  fetch(config.NEBULA_URL + "api/upload-style", {
    headers: {
      PSK: config.PSK,
    },
    method: "post",
    body: form,
  });
}

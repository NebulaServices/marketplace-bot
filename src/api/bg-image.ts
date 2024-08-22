import { FormData, File } from "formdata-node";
import { fileFromPath } from "formdata-node/file-from-path";
import { config } from "../config";

export function upload_bg_image(image: any, name: string) {
  const form = new FormData();
  form.set("file", new File([image], name));

  console.log(config.PSK);
  console.log(form);
  fetch(config.NEBULA_URL + "api/upload-image", {
    headers: {
      PSK: config.PSK,
    },
    method: "post",
    body: form,
  });
}

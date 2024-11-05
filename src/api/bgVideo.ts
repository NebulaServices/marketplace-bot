import { FormData, File } from "formdata-node";
import { fileFromPath } from "formdata-node/file-from-path";
import { config } from "../config";

export async function uploadBgVideo(video: any, name: string) {
  const form = new FormData();
  form.set("file", new File([video], name));

  console.log(config.PSK);
  console.log(form);
  await fetch(config.NEBULA_URL + "api/upload-asset", {
    headers: {
      PSK: config.PSK,
      packagename: name
    },
    method: "post",
    body: form
  });
}

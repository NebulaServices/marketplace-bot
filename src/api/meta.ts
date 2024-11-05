import { FormData, File } from "formdata-node";
import { fileFromPath } from "formdata-node/file-from-path";
import { config } from "../config";

export async function uploadPackageMetadata(
  uuid: string,
  title: string,
  tags: string,
  description: string,
  author: string,
  image_path: string,
  type: string,
  version: string | null = "1.0.0",
  payload: string,
  background_image_path?: string,
  background_video_path?: string
) {
  const pkgPayload = {
    uuid: uuid,
    title: title,
    tags: tags,
    description: description,
    author: author,
    image: image_path,
    type: type,
    version: version,
    payload: payload,
    background_image: background_image_path,
    bacgkround_video: background_video_path,
  };

  console.log(JSON.stringify(pkgPayload));

  await fetch(config.NEBULA_URL + "api/create-package", {
    headers: {
      "Content-Type": "application/json",
      PSK: config.PSK,
    },
    method: "post",
    body: JSON.stringify(pkgPayload),
  });
}

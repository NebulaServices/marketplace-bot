import { FormData, File } from "formdata-node";
import { fileFromPath } from "formdata-node/file-from-path";
import { config } from "../config";

export function upload_package_metadata(
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
  const pkg_payload = {
    uuid,
    title,
    tags,
    description,
    author,
    image_path,
    type,
    version,
    payload,
    background_image_path,
    background_video_path,
  };

  console.log(JSON.stringify(pkg_payload));

  fetch(config.NEBULA_URL + "api/create-package", {
    headers: {
      "Content-Type": "application/json",
      PSK: config.PSK,
    },
    method: "post",
    body: JSON.stringify(pkg_payload),
  });
}

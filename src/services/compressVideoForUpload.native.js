import { compress } from "react-native-video-trim";

export default async function compressVideoForUpload(uri) {
  const result = await compress(uri, {
    quality: "medium",
    width: 720,
    frameRate: 30,
    outputExt: "mp4",
  });
  return result.outputPath.startsWith("file://")
    ? result.outputPath
    : `file://${result.outputPath}`;
}

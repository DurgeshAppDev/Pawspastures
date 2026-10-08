import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpegPromise;

async function getFFmpeg() {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const ffmpeg = new FFmpeg();
      const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      return ffmpeg;
    })();
  }
  return ffmpegPromise;
}

export default async function compressVideoForUpload(uri) {
  const ffmpeg = await getFFmpeg();
  const input = `input-${Date.now()}.mp4`;
  const output = `output-${Date.now()}.mp4`;
  await ffmpeg.writeFile(input, await fetchFile(uri));
  try {
    await ffmpeg.exec([
      "-i", input,
      "-vf", "scale='min(720,iw)':-2",
      "-r", "30",
      "-c:v", "libx264",
      "-crf", "28",
      "-preset", "ultrafast",
      "-c:a", "aac",
      "-b:a", "128k",
      "-movflags", "+faststart",
      output,
    ]);
    const bytes = await ffmpeg.readFile(output);
    return new Blob([bytes], { type: "video/mp4" });
  } finally {
    await ffmpeg.deleteFile(input).catch(() => {});
    await ffmpeg.deleteFile(output).catch(() => {});
  }
}

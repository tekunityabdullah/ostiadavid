// Seeds a track/video into the Unreleased library for local testing.
//
// Usage:
//   node scripts/seed-unreleased-media.mjs
//   node scripts/seed-unreleased-media.mjs --title "My Song" --file ./demo.mp3
//   node scripts/seed-unreleased-media.mjs --title "Teaser" --type video --file ./clip.mp4
//
// With no --file, a short generated 440Hz test tone (WAV) is uploaded instead,
// so `node scripts/seed-unreleased-media.mjs` alone is enough to sanity-check
// the streaming pipeline.
//
// Reads Supabase credentials from .env.local (falls back to .env).

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

function loadEnv() {
  const env = {};
  for (const file of [".env.local", ".env"]) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, "utf-8").replace(/\r\n/g, "\n");
    for (const line of content.split("\n")) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && !(match[1] in env)) env[match[1]] = match[2].trim();
    }
  }
  return env;
}

function parseArgs() {
  const args = { title: null, type: "audio", file: null, description: null, cover: null };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--title") args.title = value;
    else if (key === "--type") args.type = value;
    else if (key === "--file") args.file = value;
    else if (key === "--description") args.description = value;
    else if (key === "--cover") args.cover = value;
    else continue;
    i++;
  }
  return args;
}

// Builds a short playable WAV — 3s, 44.1kHz mono, a fading-in/out 440Hz tone —
// just enough to verify playback end-to-end without needing a real asset.
function buildTestTone() {
  const sampleRate = 44100;
  const seconds = 3;
  const numSamples = sampleRate * seconds;
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  const freq = 440;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = Math.min(1, t * 4) * Math.min(1, (seconds - t) * 4);
    const sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.2;
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + i * 2);
  }

  return buffer;
}

const CONTENT_TYPES = {
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
};

async function main() {
  const args = parseArgs();

  if (args.type !== "audio" && args.type !== "video") {
    console.error(`Invalid --type "${args.type}" — must be "audio" or "video".`);
    process.exit(1);
  }

  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, key);

  let fileBuffer;
  let uploadName;
  let contentType;

  if (args.file) {
    if (!fs.existsSync(args.file)) {
      console.error(`File not found: ${args.file}`);
      process.exit(1);
    }
    fileBuffer = fs.readFileSync(args.file);
    const ext = path.extname(args.file).toLowerCase();
    uploadName = `${Date.now()}-${path.basename(args.file)}`;
    contentType = CONTENT_TYPES[ext] || (args.type === "video" ? "video/mp4" : "audio/mpeg");
  } else {
    if (args.type === "video") {
      console.error("Generating a placeholder isn't supported for --type video — pass --file <path>.");
      process.exit(1);
    }
    fileBuffer = buildTestTone();
    uploadName = `test-${Date.now()}.wav`;
    contentType = "audio/wav";
  }

  const title = args.title || (args.file ? path.basename(args.file, path.extname(args.file)) : "Test Track (440Hz Tone)");

  console.log(`Uploading "${uploadName}" to unreleased-media bucket...`);
  const { error: uploadError } = await supabase.storage
    .from("unreleased-media")
    .upload(uploadName, fileBuffer, { contentType });

  if (uploadError) {
    console.error("Upload failed:", uploadError.message);
    process.exit(1);
  }

  const { data, error } = await supabase
    .from("unreleased_media")
    .insert({
      title,
      media_type: args.type,
      description: args.description || (args.file ? null : "Seeded via scripts/seed-unreleased-media.mjs to verify streaming."),
      cover_image: args.cover || null,
      file_path: uploadName,
    })
    .select()
    .single();

  if (error) {
    console.error("Insert failed:", error.message);
    process.exit(1);
  }

  console.log("Added to Unreleased library:");
  console.log(data);
}

main();

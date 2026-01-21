import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const loadEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const contents = fs.readFileSync(filePath, "utf8");
  const lines = contents.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }
    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
};

loadEnvFile(path.join(rootDir, ".env.local"));

const mongoUri = process.env.MONGO_DB_URI || process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("Missing MONGO_DB_URI or MONGODB_URI in environment.");
  process.exit(1);
}

const ensureCollection = async (model) => {
  try {
    await model.createCollection();
  } catch (error) {
    if (error?.code === 48 || error?.codeName === "NamespaceExists") {
      return;
    }
    throw error;
  }
};

try {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });

  const { default: User } = await import("../app/models/user.js");
  const { default: Agent } = await import("../app/models/agent.js");

  await ensureCollection(User);
  await ensureCollection(Agent);

  await User.createIndexes();
  await Agent.createIndexes();

  console.log("MongoDB migration complete: users and agents collections ready.");
} catch (error) {
  console.error("MongoDB migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}

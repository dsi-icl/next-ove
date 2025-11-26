import { nanoid } from "nanoid";
import prompt from "prompt";
import { PrismaClient } from ".prisma/client";

const prisma = new PrismaClient();

const load = async () => {
  const { service } = await getDetails();
  const key = nanoid(16);

  await prisma.service.create({
    data: {
      service,
      key,
      role: "bridge",
    },
  });

  printMessage(service, key);
};

const getDetails = () => {
  prompt.start();
  prompt.message = "Enter details:\n";
  prompt.delimiter = "";
  return prompt.get({
    properties: {
      service: {
        message: "service (name):",
        required: true,
      },
    },
  }) as Promise<{ service: string }>;
};

const printMessage = (service: string, key: string) => {
  console.log("");
  console.log("───────────────────────────────────────────────────────────");
  console.log("✅ Service created:");
  console.log(`   service: ${service}`);
  console.log("───────────────────────────────────────────────────────────");
  console.log("🔑 IMPORTANT: This is the ONLY time the key will be shown.");
  console.log("   Copy and store it securely NOW:");
  console.log("");
  console.log(`   KEY: ${key}`);
  console.log("");
  console.log("   Treat it like a password. Do not share it publicly.");
  console.log("───────────────────────────────────────────────────────────");
};

load().catch(console.error);

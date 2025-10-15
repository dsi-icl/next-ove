const { nanoid } = require("nanoid");
const prompt = require("prompt");
const PrismaClient = require(".prisma/client").PrismaClient;

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

/** @type { () => Promise<{service: string}> } */
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
  });
};

const printMessage = (service, key) => {
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

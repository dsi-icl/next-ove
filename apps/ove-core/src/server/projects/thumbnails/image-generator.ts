import type { Client } from "minio";

import { env } from "../../../env";
import { S3Controller } from "../s3-controller";
import { buildPrompt, NEGATIVE_PROMPT } from "./prompts";

export interface ImageGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  size?: string;
  background?: "transparent" | "white";
  endpoint: string;
  apiKey: string;
  model: string;
}

export interface ImageGenerationResult {
  imageUrl?: string;
  base64Image?: string;
}

export const uploadImage = async (
  s3: Client,
  bucket: string,
  objectName: string,
  imageUrl: string,
) => {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  return await S3Controller.uploadFile(s3, bucket, objectName, buffer);
};

export const generateImage = async (keywords: string[]) => {
  if (env.SERVICES.THUMBNAIL_GENERATOR?.PROVIDER_CONFIGURATIONS === undefined) {
    throw new Error("No provider configurations found for thumbnail generator");
  }
  switch (env.SERVICES.THUMBNAIL_GENERATOR?.PROVIDER) {
    case "openai": {
      if (
        !("openai" in env.SERVICES.THUMBNAIL_GENERATOR?.PROVIDER_CONFIGURATIONS)
      ) {
        throw new Error("Missing OpenAI provider configuration");
      }
      return imageGeneratorOpenAI({
        endpoint:
          env.SERVICES.THUMBNAIL_GENERATOR.PROVIDER_CONFIGURATIONS.openai
            .ENDPOINT,
        prompt: buildPrompt(keywords),
        negativePrompt: NEGATIVE_PROMPT,
        apiKey:
          env.SERVICES.THUMBNAIL_GENERATOR.PROVIDER_CONFIGURATIONS.openai
            .API_KEY,
        model:
          env.SERVICES.THUMBNAIL_GENERATOR.PROVIDER_CONFIGURATIONS.openai.MODEL,
        size: env.SERVICES.THUMBNAIL_GENERATOR.PROVIDER_CONFIGURATIONS.openai
          .SIZE,
        background:
          env.SERVICES.THUMBNAIL_GENERATOR.PROVIDER_CONFIGURATIONS.openai
            .BACKGROUND,
      });
    }
    default:
      throw new Error("No provider found for thumbnail generator");
  }
};

export const imageGeneratorOpenAI = async (
  options: ImageGenerationOptions,
): Promise<ImageGenerationResult> => {
  const response = await fetch(options.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model,
      prompt: options.prompt,
      negative_prompt: options.negativePrompt,
      size: options.size ?? "1024x1024",
      background: options.background ?? "transparent",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Image generation failed: ${errorText}`);
  }

  const data = (await response.json()) as {
    data: { url: string; b64_json: string }[] | undefined;
  };

  return {
    imageUrl: data.data?.[0]?.url,
    base64Image: data.data?.[0]?.b64_json,
  };
};

/* global File, FileList */

import { adminProcedure, router } from "../trpc";
import { logger } from "../../env";
import bcrypt from "bcryptjs";
import { S3Controller } from "../projects/s3-controller";
import { z } from "zod";
import { env } from "../../env";
import { UserSchema } from "../schemas";
import { clickhouse } from "../clickhouse";

const UserFormSchema = z.strictObject({
  name: z.string().trim().min(1, "Name is required"),
  username: z.string().trim().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  role: z.union([z.literal("admin"), z.literal("creator")]),
  icon: z.string().optional(),
});

const TaskStatusSchema = z.strictObject({
  state: z.enum(["pending", "processing", "completed", "failed"]),
  created_at: z.string(),
  type: z.enum(["dzi", "latex", "markdown"]),
  file: z.string(),
  error: z.string().optional(),
  completed_at: z.string().optional(),
});

export const adminRouter = router({
  createUser: adminProcedure
    .meta({
      openapi: {
        method: "POST" as const,
        path: "/admin/user" as const,
        protect: true,
      },
    })
    .input(UserFormSchema)
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      logger.info("Creating user: ", input.username);
      const hash = bcrypt.hashSync(input.password, env.SALT_ROUNDS);
      let url: string | undefined = undefined;
      if (input.icon !== undefined && env.SERVICES.ASSET_STORE !== undefined) {
        url = `${env.SERVICES.ASSET_STORE.USE_SSL ? "https" : "http"}://${env.SERVICES.ASSET_STORE.END_POINT}:${env.SERVICES.ASSET_STORE.PORT}/${env.SERVICES.ASSET_STORE.USER_BUCKET}/${input.icon}`;
      }
      await ctx.prisma.user.create({
        data: {
          name: input.name,
          username: input.username,
          email: input.email,
          password: hash,
          role: input.role,
          icon: url,
        },
      });
      return undefined;
    }),
  getUserProfileUpload: adminProcedure
    .meta({
      openapi: {
        method: "GET" as const,
        path: "/admin/user/profile" as const,
        protect: true,
      },
    })
    .input(z.strictObject({ filename: z.string() }))
    .output(z.string())
    .query(({ input, ctx }) => {
      logger.info("Getting presigned PUT url for:", input.filename);
      if (ctx.s3 === null || env.SERVICES.ASSET_STORE === undefined) {
        throw new Error("File storage not configured");
      }
      return S3Controller.getPresignedPutURL(
        ctx.s3,
        env.SERVICES.ASSET_STORE.USER_BUCKET,
        input.filename,
      );
    }),
  getUsers: adminProcedure
    .meta({
      openapi: {
        method: "GET" as const,
        path: "/admin/users" as const,
        protect: true,
      },
    })
    .input(z.void())
    .output(UserSchema.array())
    .query(({ ctx }) => {
      logger.info("Getting users");
      return ctx.prisma.user.findMany({
        select: {
          email: true,
          icon: true,
          id: true,
          name: true,
          role: true,
          username: true,
        },
      });
    }),
  getProjectCount: adminProcedure
    .meta({
      openapi: {
        method: "GET" as const,
        path: "/admin/projects/count" as const,
        protect: true,
      },
    })
    .input(z.void())
    .output(z.strictObject({ total: z.number(), change: z.number() }))
    .query(async ({ ctx }) => {
      logger.info("Getting project count");
      const total = await ctx.prisma.project.count({
        where: { isDeleted: false },
      });
      const created = await ctx.prisma.project.count({
        where: {
          created_at: { gt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) },
        },
      });
      const deleted = await ctx.prisma.project.count({
        where: {
          isDeleted: true,
          updated_at: { gt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) },
        },
      });
      return {
        total,
        change: total === 0 ? 0 : ((created - deleted) / total) * 100,
      };
    }),
  getTasks: adminProcedure
    .meta({
      openapi: {
        method: "GET" as const,
        path: "/formatter/tasks" as const,
        protect: true,
      },
    })
    .input(z.void())
    .output(z.record(z.string(), TaskStatusSchema.array()))
    .query(async () => {
      logger.info("Getting data-formatter task statuses");
      if (env.SERVICES.DATA_FORMATTER === undefined)
        throw new Error("Data formatter not configured");
      const res = await fetch(env.SERVICES.DATA_FORMATTER.URL + "/api/queue/", {
        headers: { "X-API-Key": env.SERVICES.DATA_FORMATTER.API_KEY },
      });
      const tasks = Object.values((await res.json()) as Record<string, unknown>).flat() as z.infer<typeof TaskStatusSchema>[];
      console.log(tasks);
      const grouped = tasks.reduce<Record<string, z.infer<typeof TaskStatusSchema>[]>>(
        (acc, task) => {
          const key = task.file.split("/").at(0) ?? "unknown";

          if (!acc[key]) {
            acc[key] = [];
          }

          acc[key].push(task);
          return acc;
        },
        {},
      );
      console.log(grouped);
      return grouped;
    }),
  rerunTask: adminProcedure
    .meta({
      openapi: {
        method: "GET" as const,
        path: "/formatter/task/rerun" as const,
        protect: true,
      },
    })
    .input(
      z.strictObject({
        objectName: z.string(),
        bucketName: z.string(),
        versionId: z.string(),
        taskType: z.enum(["dzi", "markdown", "latex"]),
      }),
    )
    .output(z.void())
    .mutation(async ({ input }) => {
      logger.info(
        `Rerunning task on ${input.bucketName}/${input.objectName}?version_id=${input.versionId}`,
      );
      logger.info("Getting data-formatter task statuses");
      if (env.SERVICES.DATA_FORMATTER === undefined)
        throw new Error("Data formatter not configured");
      const formData = new FormData();
      formData.append("bucket", input.bucketName);
      formData.append("source_object", input.objectName);
      formData.append("version_id", input.versionId);

      await fetch(env.SERVICES.DATA_FORMATTER.URL + `/api/convert/${input.taskType}`, {
        method: "POST",
        headers: {
          "X-API-Key": env.SERVICES.DATA_FORMATTER.API_KEY,
        },
        body: formData,
      });
    }),
  getDemoLaunches: adminProcedure
    .meta({
      openapi: {
        method: "GET" as const,
        path: "/analytics/demo_launches" as const,
        protect: true,
      },
    })
    .input(z.void())
    .output(
      z.strictObject({
        thisMonth: z.number(),
        lastMonth: z.number(),
        percentChange: z.number(),
        total: z.number(),
      })
    )
    .query(async () => {
      logger.info("Getting demo launch stats");
      if (clickhouse === undefined) throw new Error("ClickHouse not configured");
      const query = `
        WITH
          toStartOfMonth(now()) AS start_this_month,
          toStartOfMonth(addMonths(now(), -1)) AS start_last_month,
          toStartOfMonth(addMonths(now(), 1)) AS start_next_month

        SELECT
          countIf(
            timestamp >= start_this_month
            AND timestamp < start_next_month
          ) AS this_month,
          countIf(
            timestamp >= start_last_month
            AND timestamp < start_this_month
          ) AS last_month,
          count() AS total_ever
        FROM analytics_events
        WHERE event = 'demo_launch'
      `;

      const result = await clickhouse.query({
        query,
        format: "JSONEachRow",
      });

      const rows = await result.json<{
        this_month: number;
        last_month: number;
        total_ever: number;
      }>();

      const thisMonth = rows[0]?.this_month ?? 0;
      const lastMonth = rows[0]?.last_month ?? 0;
      const total = rows[0]?.total_ever ?? 0;

      let percentChange = 0;

      if (lastMonth > 0) {
        percentChange = ((thisMonth - lastMonth) / lastMonth) * 100;
      } else if (thisMonth > 0) {
        percentChange = 100;
      }

      return {
        thisMonth,
        lastMonth,
        percentChange,
        total,
      };
    }),
});
import "@opentelemetry/auto-instrumentations-node/register";
import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import { randomUUID } from "node:crypto";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../db/client.ts";
import { schema } from "../db/schema/index.ts";
import { tracer } from "../tracer/tracer.ts";
import { dispatchOrderCreated } from "../broker/messages/order-created.ts";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.register(fastifyCors, { origin: "*" });

app.get("/health", () => {
  return "OK";
});

app.post(
  "/create",
  {
    schema: {
      body: z.object({
        amount: z.coerce.number(),
      }),
    },
  },
  async (request, reply) => {
    const { amount } = request.body;
    const span = tracer.startSpan("uuid-calculation");
    const orderId = randomUUID();
    span.end();
    const customerId = "B9176D35-7276-4255-A323-D825CAEE03B5";
    await db.insert(schema.orders).values({
      id: orderId,
      customerId: customerId,
      amount,
    });
    dispatchOrderCreated({
      orderId,
      amount,
      customer: {
        id: customerId,
      },
    });
    return reply.status(201).send();
  }
);

app.listen({ host: "0.0.0.0", port: 3333 }).then(() => {
  console.log("[Orders] HTTP Server running!");
});

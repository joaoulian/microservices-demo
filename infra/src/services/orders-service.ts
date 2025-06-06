import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";
import { cluster } from "../cluster";
import { ordersDockerImage } from "../images/orders-image";
import { appLoadBalancer } from "../load-balancer";
import { amqpListener } from "./rabbitmq-service";
import { executionRole } from "../roles";
// import { validatedCert } from '../certificates'

const ordersTargetGroup = appLoadBalancer.createTargetGroup("orders-target", {
  port: 3333,
  protocol: "HTTP",
  healthCheck: {
    path: "/health",
    protocol: "HTTP",
    healthyThreshold: 3,
    unhealthyThreshold: 3,
    timeout: 5,
    interval: 10,
  },
});

export const ordersHttpListener = appLoadBalancer.createListener(
  "orders-listener",
  {
    port: 3333,
    protocol: "HTTP",
    targetGroup: ordersTargetGroup,
  }
);

// const ordersHttpsListener = appLoadBalancer.createListener(
//   "orders-https-listener",
//   {
//     port: 443,
//     targetGroup: ordersTargetGroup,,
//     protocol: "HTTPS",
//     sslPolicy: "ELBSecurityPolicy-2016-08",
//     certificateArn: validatedCert.certificateArn,
//   }
// );

export const ordersService = new awsx.classic.ecs.FargateService(
  "fargate-orders",
  {
    cluster,
    desiredCount: 1,
    waitForSteadyState: false,
    taskDefinitionArgs: {
      executionRole,
      container: {
        image: ordersDockerImage.ref,
        cpu: 256,
        memory: 512,
        portMappings: [ordersHttpListener],
        environment: [
          {
            name: "BROKER_URL",
            value: pulumi.interpolate`amqp://admin:admin@${amqpListener.endpoint.hostname}:${amqpListener.endpoint.port}`,
          },
          {
            name: "OTEL_SERVICE_NAME",
            value: "orders",
          },
          {
            name: "OTEL_NODE_ENABLED_INSTRUMENTATIONS",
            value: "http,fastify,pg,amqplib",
          },
        ],
      },
    },
  }
);

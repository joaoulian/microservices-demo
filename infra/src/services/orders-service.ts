import * as awsx from "@pulumi/awsx";

import { cluster } from "../cluster";
import { ordersDockerImage } from "../images/orders-image";
import { appLoadBalancer } from "../load-balancer";

const ordersTargetGroup = appLoadBalancer.createTargetGroup("orders-target", {
  port: 3333,
  protocol: "HTTP",
  healthCheck: {
    path: "/health",
    protocol: "HTTP",
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

export const ordersService = new awsx.classic.ecs.FargateService(
  "fargate-orders",
  {
    cluster,
    desiredCount: 1,
    waitForSteadyState: false,
    taskDefinitionArgs: {
      container: {
        image: ordersDockerImage.ref,
        cpu: 256,
        memory: 512,
        portMappings: [ordersHttpListener],
        environment: [
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

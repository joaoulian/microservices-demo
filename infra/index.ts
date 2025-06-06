import * as pulumi from "@pulumi/pulumi";
import { ordersService } from "./src/services/orders-service";
import { rabbitMQService } from "./src/services/rabbitmq-service";
import { appLoadBalancer } from "./src/load-balancer";
import { kongService } from "./src/services/kong-service";

export const ordersId = ordersService.service.id;
export const rabbitMQId = rabbitMQService.service.id;
export const rabbitMQAdminUrl = pulumi.interpolate`http://${appLoadBalancer.listeners[0].endpoint.hostname}:15672`;
export const kongId = kongService.service.id;
export const kongAdminUrl = pulumi.interpolate`http://${appLoadBalancer.listeners[0].endpoint.hostname}:8002`;

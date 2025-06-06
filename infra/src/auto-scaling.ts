import * as aws from "@pulumi/aws";
import { interpolate } from "@pulumi/pulumi";
import { ordersService } from "./services/orders-service";

const scalingTarget = new aws.appautoscaling.Target(
  "aws-workshop-autoscaling-target",
  {
    minCapacity: 1,
    maxCapacity: 2,
    serviceNamespace: "ecs",
    scalableDimension: "ecs:service:DesiredCount",
    resourceId: interpolate`service/${ordersService.cluster.cluster.name}/${ordersService.service.name}`,
  }
);

new aws.appautoscaling.Policy("aws-workshop-autoscaling-policy-cpu", {
  serviceNamespace: scalingTarget.serviceNamespace,
  scalableDimension: scalingTarget.scalableDimension,
  resourceId: scalingTarget.resourceId,
  policyType: "TargetTrackingScaling",
  targetTrackingScalingPolicyConfiguration: {
    predefinedMetricSpecification: {
      predefinedMetricType: "ECSServiceAverageCPUUtilization",
    },
    targetValue: 50,
  },
});

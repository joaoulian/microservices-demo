import * as aws from "@pulumi/aws";

export const executionRole = new aws.iam.Role("aws-workshop-execution-role", {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: "ecs-tasks.amazonaws.com",
  }),
  managedPolicyArns: [
    "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
  ],
  inlinePolicies: [
    {
      name: "inline",
      policy: aws.iam.getPolicyDocumentOutput({
        statements: [
          {
            sid: "ReadSsmAndSecrets",
            actions: [
              "ssm:GetParameters",
              "ssm:GetParameter",
              "ssm:GetParameterHistory",
            ],
            resources: [
              "arn:aws:ssm:us-east-1:202533516528:parameter/workshop/dev/*",
            ],
          },
        ],
      }).json,
    },
  ],
});

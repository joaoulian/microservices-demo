import * as aws from "@pulumi/aws";
import { appLoadBalancer } from "./load-balancer";

const zone = aws.route53.getZone({
  // name: "livedocs.dev",
});

const cert = new aws.acm.Certificate("orders-certificate", {
  // domainName: "app.livedocs.dev",
  validationMethod: "DNS",
});

const validationRecord = new aws.route53.Record("orders-domain-record", {
  zoneId: zone.then((zone) => zone.zoneId),
  name: cert.domainValidationOptions[0].resourceRecordName,
  type: cert.domainValidationOptions[0].resourceRecordType,
  records: [cert.domainValidationOptions[0].resourceRecordValue],
  ttl: 60,
});

export const validatedCert = new aws.acm.CertificateValidation(
  "orders-acm-validation",
  {
    certificateArn: cert.arn,
    validationRecordFqdns: [validationRecord.fqdn],
  }
);

new aws.route53.Record("orders-alias", {
  zoneId: zone.then((zone) => zone.zoneId),
  name: "orders",
  type: "A",
  aliases: [
    {
      name: appLoadBalancer.loadBalancer.dnsName,
      zoneId: appLoadBalancer.loadBalancer.zoneId,
      evaluateTargetHealth: true,
    },
  ],
});

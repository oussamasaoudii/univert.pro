import test from "node:test";
import assert from "node:assert/strict";
import {
  buildAapanelCreateDatabasePayload,
  buildAapanelCreateSitePayload,
} from "./request-builders.ts";

test("buildAapanelCreateSitePayload formats aaPanel AddSite payload", () => {
  const payload = buildAapanelCreateSitePayload({
    domain: "client.univoo.co",
    rootPath: "/www/wwwroot/client.univoo.co/public",
    phpVersion: "82",
    note: "Provisioned for website-1",
  });

  assert.equal(payload.path, "/www/wwwroot/client.univoo.co/public");
  assert.equal(payload.type, "PHP");
  assert.equal(payload.version, "82");
  assert.equal(payload.ftp, false);
  assert.equal(payload.sql, false);
  assert.deepEqual(JSON.parse(String(payload.webname)), {
    domain: "client.univoo.co",
    domainlist: [],
    count: 0,
  });
});

test("buildAapanelCreateDatabasePayload formats aaPanel AddDatabase payload", () => {
  const payload = buildAapanelCreateDatabasePayload({
    databaseName: "ovm_client1",
    username: "ovmu_client1",
    password: "strong-password",
    host: "127.0.0.1",
  });

  assert.equal(payload.name, "ovm_client1");
  assert.equal(payload.db_user, "ovmu_client1");
  assert.equal(payload.password, "strong-password");
  assert.equal(payload.dtype, "MySQL");
  assert.equal(payload.codeing, "utf8mb4");
  assert.equal(payload.dataAccess, "127.0.0.1");
  assert.equal(payload.address, "127.0.0.1");
});

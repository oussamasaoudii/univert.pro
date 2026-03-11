import type { AapanelSitePayload } from "./types";

export function buildAapanelCreateSitePayload(payload: AapanelSitePayload) {
  return {
    webname: JSON.stringify({
      domain: payload.domain,
      domainlist: [],
      count: 0,
    }),
    path: payload.rootPath,
    type_id: 0,
    type: "PHP",
    version: payload.phpVersion,
    port: 80,
    ps: payload.note,
    ftp: false,
    sql: false,
  } satisfies Record<string, string | number | boolean>;
}

export function buildAapanelCreateDatabasePayload(input: {
  databaseName: string;
  username: string;
  password: string;
  host: string;
}) {
  return {
    name: input.databaseName,
    db_user: input.username,
    password: input.password,
    codeing: "utf8mb4",
    dtype: "MySQL",
    dataAccess: input.host,
    address: input.host,
    sid: 0,
    active: false,
    ps: input.databaseName,
    ssl: "",
  } satisfies Record<string, string | number | boolean>;
}

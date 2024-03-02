import { connect } from "@planetscale/database";
import { DomainProps, ProjectProps } from "./types";

export const pscale_config = {
  url: process.env.DATABASE_URL,
};

export const conn = connect(pscale_config);

export const getProjectViaEdge = async (projectId: string) => {
  if (!process.env.DATABASE_URL) return null;

  const { rows } =
    (await conn.execute("SELECT * FROM Project WHERE id = ?", [projectId])) ||
    {};

  return rows && Array.isArray(rows) && rows.length > 0
    ? (rows[0] as ProjectProps)
    : null;
};

export const getDomainViaEdge = async (domain: string) => {
  if (!process.env.DATABASE_URL) return null;

  const { rows } =
    (await conn.execute("SELECT * FROM Domain WHERE slug = ?", [domain])) || {};

  return rows && Array.isArray(rows) && rows.length > 0
    ? (rows[0] as DomainProps)
    : null;
};

export const getLinkViaEdge = async (domain: string, key: string) => {
  if (!process.env.DATABASE_URL) return null;

  const { rows } =
    (await conn.execute(
      "SELECT * FROM Link WHERE domain = ? AND `key` = ?",
      [domain, decodeURIComponent(key)], // we need to make sure that the key is always decoded (cause that's how we store it in MySQL)
    )) || {};

  return rows && Array.isArray(rows) && rows.length > 0
    ? (rows[0] as {
        id: string;
        domain: string;
        key: string;
        url: string;
        proxy: number;
        title: string;
        description: string;
        image: string;
        rewrite: number;
        password: string | null;
        expiresAt: string | null;
        ios: string | null;
        android: string | null;
        geo: object | null;
        projectId: string;
        publicStats: number;
      })
    : null;
};

export const getLinkViaEdgeByURL = async (url: string) => {
  if (!process.env.DATABASE_URL) return null;

  const { rows } =
    (await conn.execute("SELECT * FROM Link WHERE url = ?", [url])) || {};

  return rows && Array.isArray(rows) && rows.length > 0
    ? (rows[0] as {
        id: string;
        domain: string;
        key: string;
        url: string;
        proxy: number;
        title: string;
        description: string;
        image: string;
        rewrite: number;
        password: string | null;
        expiresAt: string | null;
        ios: string | null;
        android: string | null;
        geo: object | null;
        projectId: string;
        publicStats: number;
      })
    : null;
}

export const getAffiliateViaEdge = async (projectId: string, username: string) => {
  if (!process.env.DATABASE_URL) return null;

  const { rows } =
    (await conn.execute(
      "SELECT * FROM Affiliate WHERE projectId = ? AND username = ?",
      [projectId, username],
    )) || {};

  return rows && Array.isArray(rows) && rows.length > 0
    ? (rows[0] as {
        id: string;
        username: string;
        email: string;
        projectId: string;
        userId?: string;
      })
    : null;
}

export const getUserFromApiKeyViaEdge = async (hashedKey: string) => {
  if (!process.env.DATABASE_URL) return null;

  const { rows } =
    (await conn.execute(
      "SELECT * FROM User u INNER JOIN Token t ON u.id = t.userId WHERE hashedKey = ? LIMIT 1",
      [hashedKey],
    )) || {};

  return rows && Array.isArray(rows) && rows.length > 0
    ? (rows[0] as {
        id: string;
        name: string;
        email: string;
      })
    : null;
}

export const updateApiKeyViaEdge = async (hashedKey: string, lastUsed: Date) => {
  if (!process.env.DATABASE_URL) return null;

  return await conn.execute(
    "UPDATE Token SET lastUsed = ? WHERE hashedKey = ?",
    [lastUsed, hashedKey],
  );
}

export async function getDomainOrLink({
  domain,
  key,
}: {
  domain: string;
  key?: string;
}) {
  if (!key || key === "_root") {
    const data = await getDomainViaEdge(domain);
    if (!data) return null;
    return {
      ...data,
      key: "_root",
      url: data?.target,
    };
  } else {
    return await getLinkViaEdge(domain, key);
  }
}

import { client } from "./redis.connection.js";

export async function setString({ key, value, expType = "EX", expValue }) {
  return await client.set(key, value, {
    expiration: { type: expType, value: Math.floor(expValue) },
  });
}

export async function getString(key) {
  return await client.get(key);
}

export async function incr(key) {
  return await client.incr(key);
}

export async function mget(...keys) {
  return await client.mGet(keys);
}

export async function del(...keys) {
  return await client.del(keys);
}

export async function ttl(key) {
  return await client.ttl(key);
}

export async function expire(key, seconds) {
  return await client.expire(key, Math.floor(seconds));
}

export async function persist(key) {
  return await client.persist(key);
}

export async function exists(key) {
  return await client.exists(key);
}

export async function update(key, value) {
  const isExist = await exists(key);
  if (!isExist) return 0;
  await client.set(key, value);
  return 1;
}

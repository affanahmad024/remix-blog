import { createCookie } from "@remix-run/node";
import jwt from "jsonwebtoken";
import process from "node:process";

export const cookieStore = createCookie("cookieStore", {
  maxAge: 604_800, // one week
});

export const getTokenFromCookie = async (request) => {
  const cookiesHeader = await request.headers.get("Cookie");
  const { token } = await cookieStore.parse(cookiesHeader);

  return token;
};

export const setTokenToCookie = async (store, token, ) => {
  const serialisedCookie = await store.serialize({ token })
  console.log(serialisedCookie)
  return {
    headers: { "Set-Cookie": serialisedCookie, },
  };
};
export const getUserFromToken = async (token) => {
  const id  = await jwt.verify(token, process.env.JWT_SECRET_KEY);
  console.log(id)
  return id.id;
};

export const createToken = (data, options = {}) =>
  jwt.sign(data, process.env.JWT_SECRET_KEY, { expiresIn: "7d", ...options });

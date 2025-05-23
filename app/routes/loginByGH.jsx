import * as arctic from "arctic";
import { github } from "../lib/auth/gh";
import { redirect } from "@remix-run/react";

export const loader = async () => {
  const state = arctic.generateState();
  const scopes = ["user:email"];
  const url = github.createAuthorizationURL(state, scopes);
  return redirect(url);
};

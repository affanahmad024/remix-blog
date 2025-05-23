import * as arctic from "arctic";
import process from 'node:process'

export const github = new arctic.GitHub(
  process.env.GH_CLIENT_ID,
  process.env.GH_CLIENT_SECRET,
  "http://remix-blog-ecru.vercel.app/callback"
);

import * as arctic from "arctic";
import { github } from "../lib/auth/gh";
import Users from "../../models/user.model";
import { cookieStore, createToken } from "../cookies.server";
import { redirect } from "@remix-run/react";

export const loader = async ({ request }) => {
  const code = new URL(request.url).searchParams.get("code");
  // const state = new URL(request.url).searchParams.get('state')

  try {
    const tokens = await github.validateAuthorizationCode(code);
    const accessToken = tokens.accessToken();
    const email = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((r) => r.json())
      .then((data) => data[0].email);

      console.log({email})

    const emailUser = await Users.findOne({ email });
    console.log({emailUser})
    if (!emailUser?.id) return redirect('/register')
    // console.log({emailUser})
    const token = await createToken({
      id: emailUser.id,
    });
    if (!token) return new Response("No token set");

    return redirect("/user/" + emailUser._id, {
      headers: { "Set-Cookie": await cookieStore.serialize({ token }) },
    });

  } catch (e) {
    if (e instanceof arctic.OAuth2RequestError) {
      // Invalid authorization code, credentials, or redirect URI
      //   const code = e.code;
      return { error: e.code };
      // ...
    }
    if (e instanceof arctic.ArcticFetchError) {
      // Failed to call `fetch()`
      //   const cause = e.cause;
      return { errorCause: e.cause };
      // ...
    }
    // Parse error
  }
};

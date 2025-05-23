import { redirect } from "@remix-run/react";
import { cookieStore } from "../cookies.server";

export const loader = async ({ request }) => {
  await request.headers.delete("Cookie");
  await request.headers.delete("Set-Cookie");

  return redirect("/login", {
    headers: {
      "Set-Cookie": await cookieStore.serialize(""),
    },
  });
};

// export const loader = () => redirect("/login");

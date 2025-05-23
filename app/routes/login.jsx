import { Form, Link, redirect, useActionData } from "@remix-run/react";
import Users from "../../models/user.model";
import bcrypt from "bcrypt";

import { cookieStore, createToken } from "../cookies.server";

// export const loader = async ({request}) {
//   const cookiesHeader = await request.headers.get('cookie')
//   const token = await cookieStore.parse(cookiesHeader) || {}

//   return json({token: token.})

// }

export const action = async ({ request }) => {
  const fd = await request.formData();
  const email = fd.get("email");
  const password = fd.get("password");

  const emailUser = await Users.findOne({ email });

  if (!emailUser) {
    return Response.json({ message: "User not found" });
  }

  const passwordMatch = bcrypt.compareSync(password, emailUser.password);

  if (!passwordMatch) {
    return Response.json({ message: "Incorrect password" });
  }

  // const getTokenFromCookie = async (request) => {
  //   const cookiesHeader = request.headers.get('cookie')
  //   const { token } = (await cookieStore.parse(cookiesHeader)) || {}
  //   return token
  // }
  // const cookiesHeader = await request.headers.get('Cookie')
  // const token = await cookieStore.parse(cookiesHeader) || {}

  const token = await createToken({
    id: emailUser.id,
  });
  console.log({ loginToken: token });
  if (!token) return new Response("No token set");

  return redirect("/user/" + emailUser._id, {
    headers: { "Set-Cookie": await cookieStore.serialize({ token }) },
  });
};

const Login = () => {
  const data = useActionData();
  return (
    <>
      <main className="container">
        <Form method="post" reloadDocument>
          {data?.message}
          <input name="email" id="email" placeholder="enter your email" />
          <input
            name="password"
            id="password"
            placeholder="enter your password"
          />
          <button type="submit">Login</button>
          <Link to="/register">
            <button>register</button>
          </Link>
          {/* <Link to="/loginByGH">
            <button className="secondary">
              <img
                src="https://api.iconify.design/mdi:github.svg"
                alt="github logo"
                height="16"
                width="16"
              />
              Login by github
            </button>
          </Link> */}
        </Form>
      </main>
    </>
  );
};

export default Login;

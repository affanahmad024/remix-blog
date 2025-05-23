import { Form, Link, redirect, useActionData } from "@remix-run/react";
import Users from "../../models/user.model";
import { cookieStore, createToken,  } from "../cookies.server";

export const action = async ({ request }) => {
  const fd = await request.formData();

  const email = fd.get("email");
  const password = fd.get("password");

  if (await Users.findOne({ email }))
    return Response.json({ message: "User already exists with this email" });

  const user = new Users({
    email,
    password,
  });
  await user.save();

  const token = createToken({
    id: user.id,
  });

  return redirect("/user/" + user._id, {
    headers: { "Set-Cookie": await cookieStore.serialize({ token }) },
  });
};

const Register = () => {
  const data = useActionData();
  return (
    <>
      <main className="container">
        <Form method="post" reloadDocument>
          <p>{data?.message}</p>
          <input name="email" id="email" placeholder="email" />
          <input
            name="password"
            id="password"
            placeholder="password"
            type="password"
          />
          <button type="submit">Register</button>
          <Link to="/login">
            <button>Login</button>
          </Link>
        </Form>
      </main>
    </>
  );
};

export default Register;

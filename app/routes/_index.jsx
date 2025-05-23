import { Link, useLoaderData } from "@remix-run/react";
import Posts from "../../models/post.model";
import Users from "../../models/user.model";

export const meta = () => {
  return [
    { title: "remix-blog" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async () => {
  const allPosts = await Posts.find().sort({updatedAt: -1})
  const allUsers = await Users.find()
  return Response.json({allPosts,allUsers})
}

export default function Index() {

  const {allPosts,allUsers} = useLoaderData()


  return (
    <>
      <main className="container">
        <hgroup >
          <h1>Publish your passions, your way</h1>
          <h3>Create a unique and beautiful blog easily.</h3>
        </hgroup>
        

        {/* showing all posts */}
        <h3>All Posts</h3>
        {allPosts.map((post) => (
          <article key={post._id}>
            <Link to={`/post/${post._id}`}>
              title: {post.title}<br />
              body: {post.body} <br />
              {/* views: {post.views} <br /> */}
            </Link>
          </article>
        ))}

        {/* showing all users */}
        <h3>All Users</h3>
        {allUsers.map((user) => (

          <article key={user._id}>
            <Link to={`/user/${user._id}`}>
              {user.email}
            </Link>
          </article>
        ))}
      </main>
    </>
  );
}

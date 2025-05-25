"use server";
import { Form, Link, redirect, useLoaderData } from "@remix-run/react";
import Users from "../../models/user.model";
import Posts from "../../models/post.model";
import { getTokenFromCookie, getUserFromToken } from "../cookies.server";
import { useState } from "react";

// let userid;
export const loader = async ({ params, request }) => {
  const id = params.userId;
  // userid = id;
  // console.log("Loader received id:", id);
  console.log("user");

  try {
    let user = await Users.findById(id);
    if (!user) {
      // console.error("User not found for id:", id);
      // Optionally throw an error or return a not found response.
      // return Response.json({ "User not found for userId: ": id });
      return redirect("/");
    }
    const posts = await Posts.find({ userId: id }).sort({ updatedAt: -1 });
    const count = posts.length;
    // console.log(user);
    const token = await getTokenFromCookie(request);
    // console.log("token", token);
    if (!token) return redirect("/logout");
    let userId = await getUserFromToken(token);
    // console.log(userId, id);
    const isVerified = userId === id;
    return Response.json({
      userId: user.id,
      loggedInUser: userId,
      userPosts: posts,
      userCount: count,
      isVerified,
    });
  } catch (e) {
    return redirect("/");
  }
};

export const action = async ({ request }) => {
  // let userId = userid;

  if (request.method == "POST") {
    const fd = await request.formData();

    const title = fd.get("title");
    const body = fd.get("body");
    const userId = fd.get("userId");

    const post = new Posts({
      title: title,
      body: body,
      userId: userId,
    });
    await post.save();
  }

  if (request.method == "PUT") {
    const fd = await request.formData();

    const title = fd.get("title");
    const body = fd.get("body");
    const pid = fd.get("pid");

    await Posts.findByIdAndUpdate(pid, { title, body });
    return redirect(`/post/${pid}`);
  }

  if (request.method === "DELETE") {
    // console.log(request);
    const postId = (await request.formData()).get("postId");
    await Posts.findByIdAndDelete(postId);
  }

  return null;
};

function User() {
  const {
    userId: singleUser,
    loggedInUser,
    userCount,
    userPosts,
    isVerified,
    ...data
  } = useLoaderData();
  const [isEditable, setEditable] = useState(false);
  const [pid, setPid] = useState();
  return (
    <main className="container">
      <hgroup>
        <h1>User ID: {loggedInUser}</h1>
        <h1>Total Posts: {userCount}</h1>
      </hgroup>
      {/* <pre>{JSON.stringify(data)}</pre> */}
      {/* {console.log(JSON.stringify(data))} */}
      {isVerified ? (
        <Form method="post">
          <textarea name="title" id="title" placeholder="input post title" />
          <textarea name="body" id="body" placeholder="input post body" />
          <input name="userId" type="hidden" value={singleUser} />
          <button type="submit">Create Post</button>
        </Form>
      ) : (
        <>Posts of user: {singleUser}</>
      )}

      <div>{data.isVerified}</div>
      {userPosts.map((post) => (
        <article key={post._id}>
          {isEditable && pid == post._id ? (
            <>
              <Form method="put">
                <textarea name="title" id="title" defaultValue={post.title} />
                <textarea name="body" id="body" defaultValue={post.body} />
                <input
                  type="hidden"
                  name="pid"
                  id="pid"
                  defaultValue={post._id}
                />
                <button type="submit">Submit Edited Post</button>
              </Form>
            </>
          ) : (
            <>
              <Link to={`/post/${post._id}`}>
                title: {post.title}
                <br />
                <br />
                body: {post.body}
              </Link>

              {isVerified ? (
                <>
                  <br />
                  <br />
                  <button
                    onClick={() => {
                      setEditable(true);
                      setPid(post._id);
                    }}
                    style={{ width: "100%" }}
                  >
                    Edit Post
                  </button>
                  <br />
                  <br />
                  <Form method="delete">
                    <input type="hidden" name="postId" value={post._id} />
                    <button type="submit">Delete Post</button>
                  </Form>
                </>
              ) : (
                <></>
              )}
            </>
          )}

          {/* 
                    {
                        rename == post.id ? (
                            <></>
                        ) : (
                            <button hidden={!data?.isVerified} onClick={() => setRename(post._id)}>edit</button>
                        )
                    } */}
        </article>
      ))}
    </main>
  );
}

// const User = () => {
//     const { userId } = useParams()
//     const [userPosts, setUserPosts] = useState()
//     useEffect(() => {
//         fetch(`http://localhost:3000/posts?userId=${userId}`).then(d => d.json()).then(da => setUserPosts(da))
//     }, [userId])

//     async function handlePost(e) {
//         e.preventDefault()
//         const fd = new FormData(e.target)
//         const title = fd.get('title')
//         const body = fd.get('body')
//         const post = {
//             userId,
//             title,
//             body,
//             "views": 0

//         }
//         await fetch('http://localhost:3000/posts', {
//             method: "POST",
//             body: JSON.stringify(post),
//             headers: {
//                 "Content-Type": "application/json",
//             },
//         }).then((r) => r.json());
//         await fetch(`http://localhost:3000/posts?userId=${userId}`).then(d => d.json()).then(da => setUserPosts(da))
//     }

//     async function handlePostDelete(id) {
//         await fetch(`http://localhost:3000/posts/${id}`,{method: 'DELETE'})
//         await fetch(`http://localhost:3000/posts?userId=${userId}`).then(d => d.json()).then(da => setUserPosts(da))
//     }

//     return (
//         <main className="container">
//             <form onSubmit={handlePost}>
//                 <input name="title" type="text" placeholder="Enter your blog title" />
//                 <input name="body" type="text" placeholder="Enter your blog body" />
//                 <button type="submit">Post</button>
//             </form>
//             <p>userId: {userId}</p>
//             {userPosts?.map((userPost) => (
//                 <article key={userPost.id}>
//                     <p>postId: {userPost.id}</p>
//                     <Link to={`/post/${userPost.id}`}>
//                         title: {userPost.title}<br />
//                         body: {userPost.body} <br />
//                         views: {userPost.views} <br />
//                     </Link>
//                     <button onClick={()=>{handlePostDelete(userPost.id)}}>Delete</button>
//                 </article>
//             ))}
//         </main>
//     )
// }

export default User;

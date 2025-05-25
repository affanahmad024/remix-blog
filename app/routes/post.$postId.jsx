import { Form, redirect, useLoaderData } from "@remix-run/react";
import Posts from "../../models/post.model";
import Comments from "../../models/comment.model";
import { getTokenFromCookie, getUserFromToken } from "../cookies.server";

export const loader = async ({ params, request }) => {
  const pid = params.postId;
  try {
    let post = await Posts.findById(pid);
    if (!post) {
      return redirect("/");
    }
    const comments = await Comments.find({ postId: pid }).sort({
      updatedAt: -1,
    });

    const token = await getTokenFromCookie(request);
    if (!token) return redirect("/logout");
    let userId = await getUserFromToken(token);
    const isVerified = userId == post.userId;
    return Response.json({ post, comments, isVerified });
  } catch (e) {
    return redirect("/");
  }
};

export const action = async ({ request }) => {
  if (request.method == "POST") {
    const fd = await request.formData();

    const text = fd.get("text");
    const postId = fd.get("postId");

    const comment = new Comments({
      text,
      postId: postId,
    });
    await comment.save();
  }
  if (request.method == "DELETE") {
    const fd = await request.formData();
    const postId = fd.get("postId");
    const userId = fd.get("userId");
    const commentId = fd.get("commentId");
    if (!commentId) {
      console.log(postId);
      console.log(userId);
      await Posts.findByIdAndDelete(postId);
      return redirect(`/user/${userId}`);
    }
    await Comments.findByIdAndDelete(commentId);
  }

  return null;
};

const Post = () => {
  const { post, comments, isVerified } = useLoaderData();

  return (
    <main className="container">
      <article key={post._id}>
        <p>userId: {post.userId}</p>
        <p>postId: {post._id}</p>
        title: {post.title}
        <br />
        body: {post.body} <br />
        {/* views: {post.views} <br /> */}
        {isVerified ? (
          <Form method="delete">
            <input type="hidden" name="postId" value={post._id} />
            <input type="hidden" name="userId" value={post.userId} />
            <button type="submit">delete</button>
          </Form>
        ) : (
          <></>
        )}
      </article>

      <Form method="post">
        <input name="text" type="text" placeholder="Add your comment" />
        <input name="postId" type="hidden" value={post._id} />
        <button type="submit">Comment</button>
      </Form>

      {comments?.map((comment) => (
        <article key={comment.id}>
          {comment.text} <br />
          {isVerified ? (
            <Form method="delete">
              <input type="hidden" name="commentId" value={comment._id} />
              <button type="submit">delete</button>
            </Form>
          ) : (
            <></>
          )}
        </article>
      ))}
    </main>
  );
};

// const Post = () => {
//     const { postId } = useParams()
//     const [posts, setPosts] = useState([])
//     const [comments, setComments] = useState([])
//     useEffect(() => {
//         fetch(`http://localhost:3000/posts?id=${postId}`).then(d => d.json()).then(da => setPosts(da))
//         fetch(`http://localhost:3000/comments?postId=${postId}`).then(d => d.json()).then(da => setComments(da))
//     }, [postId])

//     async function handleComment(e) {
//         e.preventDefault()
//         const fd = new FormData(e.target)
//         const text = fd.get('text')
//         const comment = {
//             postId,
//             text,
//         }
//         await fetch('http://localhost:3000/comments', {
//             method: "POST",
//             body: JSON.stringify(comment),
//             headers: {
//                 "Content-Type": "application/json",
//             },
//         }).then((r) => r.json());
//         await fetch(`http://localhost:3000/comments?postId=${postId}`).then(d => d.json()).then(da => setComments(da))
//     }

//     async function handleCommentDelete(id) {
//         await fetch(`http://localhost:3000/comments/${id}`,{method: 'DELETE'})
//         await fetch(`http://localhost:3000/comments?postId=${postId}`).then(d => d.json()).then(da => setComments(da))
//     }

//     async function handlePostDelete(id) {
//         await fetch(`http://localhost:3000/posts/${id}`,{method: 'DELETE'})
//         // return redirect(`/user/${userId}`)
//     }

//     return (
//         <main className='container'>

//             {posts.map((post) => (

//                 <article key={post.id}>
//                     <p>userId: {post.userId}</p>
//                     <p>postId: {post.id}</p>
//                     title: {post.title}<br />
//                     body: {post.body} <br />
//                     views: {post.views} <br />
//                     <button onClick={()=>{handlePostDelete(post.id)}}>Delete</button>
//                 </article>
//             ))}
//             <form onSubmit={handleComment}>
//                 <input name="text" type="text" placeholder="Add your comment" />
//                 <button type="submit">Comment</button>
//             </form>
//             {comments?.map((comment) => (
//                 <article key={comment.id}>
//                     {comment.text} <br/>
//                     <button onClick={()=>{handleCommentDelete(comment.id)}}>Delete</button>
//                 </article>
//             ))}
//         </main>
//     )
// }

export default Post;

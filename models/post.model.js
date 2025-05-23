import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'users'
    },
    title: String,
    body: String,
    views: Number
},{
    timestamps: true
}
)

const Posts = mongoose.model('posts',postSchema)

export default Posts
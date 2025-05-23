import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Types.ObjectId,
        ref: 'post'
    },
    text: String
}, {
    timestamps: true
})

const Comments = mongoose.model('comments', commentSchema)

export default Comments
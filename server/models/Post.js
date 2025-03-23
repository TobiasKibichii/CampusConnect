import mongoose from "mongoose";
 
 const postSchema = mongoose.Schema(
    {
     userId: {
      type: String,
       required: true,
       },
     firstName: {
      type: String,
       required: true,
         },
     lastName: {
        type: String,
       required: true,
       },
     location: String,
     description: String,
     picturePath: String,
     userPicturePath: String,
     type: {
       type: String,
       enum: ["post", "event"],
       default: "post",
         },
     eventDate: Date, // Only used if type = "event"
     eventLocation: String, // Only for events
     attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users attending an event
     likes: {
       type: Map,
       of: Boolean,
        },
     comments: [
   {
     type: mongoose.Schema.Types.ObjectId,
     ref: "Comment",
   },
 ],
  },
   { timestamps: true }
 );
 
 const Post = mongoose.model("Post", postSchema);
 
 export default Post;
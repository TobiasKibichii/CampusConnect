import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: { 
      type: String, 
      required: true 
    },
    lastName: { 
      type: String, 
      required: true 
    },
    // For regular posts, this can be the user's location.
    // For events, this will hold the venue details (e.g., "Venue Name, Address").
    location: { 
      type: String 
    },
    // This field remains as the title.
    description: { 
      type: String 
    },
    picturePath: { 
      type: String 
    },
    userPicturePath: { 
      type: String 
    },
    type: {
      type: String,
      enum: ["post", "event"],
      default: "post",
    },
    // Fields specific for events:
    eventDate: { 
      type: Date 
    },
    eventTimeFrom: { 
      type: Date 
    },
    eventTimeTo: { 
      type: Date 
    },
    // New fields for events:
    about: { 
      type: String 
    },
    whatYoullLearn: { 
      type: String 
    },
    // Store the raw venue ID as a reference to the Venue model
    venueId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Venue" 
    },
    // Status and processed flag for scheduler logic
    status: { 
      type: String, 
      default: "Scheduled" 
    },
    processed: { 
      type: Boolean, 
      default: false 
    },
    attendees: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      }
    ],
    likes: { 
      type: Map, 
      of: Boolean 
    },
    comments: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Comment" 
      }
    ],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;

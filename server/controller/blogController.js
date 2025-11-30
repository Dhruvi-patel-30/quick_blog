import Blog from "../models/Blog.js";
import Comment from "../models/comment.js";
import ImageKit from "imagekit";
import fs from "fs";
import main from "../configs/gemini.js";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// ============================
// ADD BLOG
// ============================
export const addBlog = async (req, res) => {
  try {
    const { title, subTitle, description, category, isPublished } = req.body;
    const imageFile = req.file;

    if (!title || !description || !category || !imageFile) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    const fileBuffer = fs.readFileSync(imageFile.path);

    const uploaded = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/blogs"
    });

    const optimizedImageUrl = imagekit.url({
      path: uploaded.filePath,
      transformation: [
        { quality: "auto" },
        { format: "webp" },
        { width: "1280" }
      ]
    });

    await Blog.create({
      title,
      subTitle,
      description,
      category,
      image: optimizedImageUrl,
      isPublished
    });

    res.json({ success: true, message: "Blog added successfully" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


// ============================
// GET ALL BLOGS (Published only)
// ============================
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true });
    res.json({ success: true, blogs });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


// ============================
// GET BLOG BY ID
// ============================
export const getBlogById = async (req, res) => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.json({ success: false, message: "Blog not found" });
    }

    res.json({ success: true, blog });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


// ============================
// DELETE BLOG BY ID  (FIXED ID BUG)
// ============================
export const deleteBlogById = async (req, res) => {
  try {
    const { id } = req.body;   // FIX: Id → id

    const deleted = await Blog.findByIdAndDelete(id);
    if (!deleted) {
      return res.json({ success: false, message: "Blog not found" });
    }

    await Comment.deleteMany({ blog: id });

    res.json({ success: true, message: "Blog deleted successfully" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


// ============================
// TOGGLE PUBLISH (IMPROVED)
// ============================
export const togglePublished = async (req, res) => {
  try {
    const { id } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.json({ success: false, message: "Blog not found" });
    }

    blog.isPublished = !blog.isPublished;
    await blog.save();

    res.json({
      success: true,
      message: `Blog ${blog.isPublished ? "Published" : "Unpublished"} successfully`
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


// ============================
// ADD COMMENT
// ============================
// ============================
// ADD COMMENT
// ============================
export const addComment = async (req, res) => {
  try {
    const { blog, content, name } = req.body; // ✅ include name

    if (!blog || !content || !name) {
      return res.status(400).json({ success: false, message: "Blog ID, name, and content are required" });
    }

    const newComment = new Comment({ blog, content, name }); // ✅ save name
    await newComment.save();

    res.json({ success: true, message: "Comment added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// ============================
// GET APPROVED COMMENTS
// ============================
export const getBlogComments = async (req, res) => {
  try {
    const { blogId } = req.body;

    const comments = await Comment.find({
      blog: blogId,
      isApproved: true
    }).sort({ createdAt: -1 });

    res.json({ success: true, comments });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const generateContent = async (req, res) =>{
  try{
    const {prompt} = req.body;
    const content = await main (prompt + ' Generate a blog cocntent for this topic in simple text format')
    res.json({success: true, content})
  }catch(error){
    res.json({success: false, message: error.message})
  }
}
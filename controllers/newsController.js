import News from "../models/news.js";

//---------------------------Create news - Admin only---------------------------
export const createNews = async (req, res) => {
  try {
    // Check if user has permission (admin only)
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        error: "Unauthorized. Only admins can create news.",
      });
    }

    // Validate required fields
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({
        error: "Title and description are required",
      });
    }

    // Check if news with same title already exists
    const existingNews = await News.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") },
    });

    if (existingNews) {
      return res.status(400).json({
        error: "News with this title already exists",
      });
    }

    // Create news with author information
    const newsData = {
      ...req.body,
      author: req.user.firstName + " " + req.user.lastName || "Admin",
    };

    const news = await News.create(newsData);
    res.status(201).json({
      success: true,
      message: "News created successfully",
      data: news,
    });
  } catch (err) {
    console.error("Error creating news:", err);
    res.status(400).json({
      error: err.message || "Failed to create news",
    });
  }
};

//---------------------------Get all news - Accessible to all authenticated users---------------------------
export const getAllNews = async (req, res) => {
  try {
    const { status, limit, page, sortBy } = req.query;

    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let sort = { createdAt: -1 }; // Default: newest first
    if (sortBy === "title") sort = { title: 1 };
    if (sortBy === "oldest") sort = { createdAt: 1 };

    const news = await News.find(filter)
      .sort(sort)
      .limit(limitNum)
      .skip(skip)
      .select("-__v");

    const total = await News.countDocuments(filter);

    res.json({
      success: true,
      data: news,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
      },
    });
  } catch (err) {
    console.error("Error fetching news:", err);
    res.status(500).json({
      error: err.message || "Failed to fetch news",
    });
  }
};

//---------------------------Delete news by title - Admin only---------------------------
export const deleteNews = async (req, res) => {
  try {
    // Check if user has permission
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        error: "Unauthorized. Only admins can delete news.",
      });
    }

    const { title } = req.params;

    if (!title) {
      return res.status(400).json({
        error: "News title is required",
      });
    }

    const news = await News.findOneAndDelete({
      title: { $regex: new RegExp(`^${title}$`, "i") },
    });

    if (!news) {
      return res.status(404).json({
        error: "News not found",
      });
    }

    res.json({
      success: true,
      message: "News deleted successfully",
      deletedNews: {
        id: news._id,
        title: news.title,
        imagePath: news.imagePath,
      },
    });
  } catch (err) {
    console.error("Error deleting news:", err);
    res.status(500).json({
      error: err.message || "Failed to delete news",
    });
  }
};

//---------------------------Update News by Title - Admin only---------------------------
export const updateNews = async (req, res) => {
  try {
    // Check if user has permission
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        error: "Unauthorized. Only admins can update news.",
      });
    }

    const { title } = req.params;
    const updateData = req.body;

    if (!title) {
      return res.status(400).json({
        error: "News title is required",
      });
    }

    // If title is being updated, check for duplicates
    if (updateData.title && updateData.title !== title) {
      const existingNews = await News.findOne({
        title: { $regex: new RegExp(`^${updateData.title}$`, "i") },
      });

      if (existingNews) {
        return res.status(400).json({
          error: "News with this title already exists",
        });
      }
    }

    // Add update timestamp
    updateData.updatedAt = new Date();

    const news = await News.findOneAndUpdate(
      { title: { $regex: new RegExp(`^${title}$`, "i") } },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!news) {
      return res.status(404).json({
        error: "News not found",
      });
    }

    res.json({
      success: true,
      message: "News updated successfully",
      data: news,
    });
  } catch (err) {
    console.error("Error updating news:", err);
    res.status(400).json({
      error: err.message || "Failed to update news",
    });
  }
};

//---------------------------Get single news by title---------------------------
export const getNewsByTitle = async (req, res) => {
  try {
    const { title } = req.params;

    const news = await News.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") },
    }).select("-__v");

    if (!news) {
      return res.status(404).json({
        error: "News not found",
      });
    }

    res.json({
      success: true,
      data: news,
    });
  } catch (err) {
    console.error("Error fetching news:", err);
    res.status(500).json({
      error: err.message || "Failed to fetch news",
    });
  }
};

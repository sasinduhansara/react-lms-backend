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

    const news = await News.create(req.body);
    res.status(201).json(news);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//---------------------------Get all news - Accessible to all authenticated users---------------------------

export const getAllNews = async (req, res) => {
  try {
    const news = await News.find();
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//---------------------------Delete department by departmentId - Admin only---------------------------

export const deleteNews = async (req, res) => {
  try {
    // Check if user has permission
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Unauthorized. Only admins can delete news.' 
      });
    }
    
    // Find by title instead of title
    const { title } = req.params;
    
    const news = await News.findOneAndDelete({ title: title });
    
    if (!news) {
      return res.status(404).json({ error: 'news not found' });
    }
    
    res.json({ 
      message: 'News deleted',
      deletedNews: news
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//---------------------------Update News by Title - Admin only---------------------------

export const updateNews = async (req, res) => {
  try {
    // Check if user has permission
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Unauthorized. Only admins can update departments.' 
      });
    }
    
    // Find by News 
    const { title } = req.params;
    
    const news = await News.findOneAndUpdate(
      { title: title },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    
    if (!news) {
      return res.status(404).json({ error: 'News not found' });
    }
    
    res.json(news);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
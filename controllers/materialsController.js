import Material from "../models/materials.js";
import Subject from "../models/subject.js";

// --------------------------- Upload material (Admin & Lecturer) ---------------------------
export const uploadMaterial = async (req, res) => {
  try {
    // Check if user has permission
    if (
      !req.user ||
      (req.user.role !== "admin" && req.user.role !== "lecturer")
    ) {
      return res.status(403).json({
        error: "Unauthorized. Only admins and lecturers can upload materials.",
      });
    }

    // Validate request body
    const { name, subject, path, url, type, size } = req.body;

    if (!name || !subject || !path || !url || !type || !size) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if subject exists
    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return res.status(404).json({ error: "Subject not found" });
    }

    // Create new material
    const material = await Material.create({
      name,
      subject,
      path,
      url,
      type,
      size,
      uploadedBy: req.user._id,
    });

    res.status(201).json(material);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// --------------------------- Get all materials (All authenticated users) ---------------------------
export const getAllMaterials = async (req, res) => {
  try {
    // Optional filtering by subject
    const { subject } = req.query;
    const filter = subject ? { subject } : {};

    const materials = await Material.find(filter)
      .populate("subject", "subjectCode subjectName")
      .populate("uploadedBy", "name role");

    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --------------------------- Get materials by subject (All authenticated users) ---------------------------
export const getMaterialsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const materials = await Material.find({ subject: subjectId })
      .populate("subject", "subjectCode subjectName")
      .populate("uploadedBy", "name role");

    if (!materials.length) {
      return res
        .status(404)
        .json({ error: "No materials found for this subject" });
    }

    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --------------------------- Update material (Admin & Uploader) ---------------------------
export const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    // Find material first to check permissions
    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }

    // Check if user has permission (admin or original uploader)
    if (
      !req.user ||
      (req.user.role !== "admin" &&
        req.user._id.toString() !== material.uploadedBy.toString())
    ) {
      return res.status(403).json({
        error:
          "Unauthorized. Only admins or the original uploader can update materials.",
      });
    }

    // Only allow updating name (other fields should remain unchanged)
    const updatedMaterial = await Material.findByIdAndUpdate(
      id,
      { name: req.body.name },
      { new: true, runValidators: true }
    );

    res.json(updatedMaterial);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// --------------------------- Delete material (Admin & Uploader) ---------------------------
export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    // Find material first to check permissions
    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }

    // Check if user has permission (admin or original uploader)
    if (
      !req.user ||
      (req.user.role !== "admin" &&
        req.user._id.toString() !== material.uploadedBy.toString())
    ) {
      return res.status(403).json({
        error:
          "Unauthorized. Only admins or the original uploader can delete materials.",
      });
    }

    // Delete from database
    await Material.findByIdAndDelete(id);

    // Note: The actual file deletion from Supabase should be handled by the frontend
    // or via a webhook when this API call succeeds

    res.json({ message: "Material deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

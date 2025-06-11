import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    // System Settings
    systemName: {
      type: String,
      default: "SLIATE Learning Management System",
    },
    systemLogo: {
      type: String,
      default: "",
    },
    systemDescription: {
      type: String,
      default: "Advanced Learning Management System for SLIATE",
    },

    // Email Settings
    emailSettings: {
      smtpHost: {
        type: String,
        default: "",
      },
      smtpPort: {
        type: Number,
        default: 587,
      },
      smtpUser: {
        type: String,
        default: "",
      },
      smtpPassword: {
        type: String,
        default: "",
      },
      fromEmail: {
        type: String,
        default: "noreply@sliate.ac.lk",
      },
    },

    // Security Settings
    securitySettings: {
      passwordMinLength: {
        type: Number,
        default: 8,
      },
      sessionTimeout: {
        type: Number,
        default: 24, // hours
      },
      maxLoginAttempts: {
        type: Number,
        default: 5,
      },
      enableTwoFactor: {
        type: Boolean,
        default: false,
      },
    },

    // File Upload Settings
    fileSettings: {
      maxFileSize: {
        type: Number,
        default: 100, // MB
      },
      allowedFileTypes: {
        type: [String],
        default: ["pdf", "doc", "docx", "ppt", "pptx", "mp4", "avi", "mov"],
      },
      storageProvider: {
        type: String,
        enum: ["supabase", "aws", "local"],
        default: "supabase",
      },
    },

    // Notification Settings
    notificationSettings: {
      enableEmailNotifications: {
        type: Boolean,
        default: true,
      },
      enablePushNotifications: {
        type: Boolean,
        default: true,
      },
      notificationFrequency: {
        type: String,
        enum: ["immediate", "daily", "weekly"],
        default: "immediate",
      },
    },

    // Academic Settings
    academicSettings: {
      currentAcademicYear: {
        type: String,
        default: new Date().getFullYear().toString(),
      },
      semesterDuration: {
        type: Number,
        default: 6, // months
      },
      gradeScale: {
        type: String,
        enum: ["A-F", "1-100", "1-4"],
        default: "A-F",
      },
      passingGrade: {
        type: Number,
        default: 50,
      },
    },

    // Maintenance Settings
    maintenanceMode: {
      enabled: {
        type: Boolean,
        default: false,
      },
      message: {
        type: String,
        default: "System is under maintenance. Please try again later.",
      },
      allowedRoles: {
        type: [String],
        default: ["admin"],
      },
    },

    // Backup Settings
    backupSettings: {
      autoBackup: {
        type: Boolean,
        default: true,
      },
      backupFrequency: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
        default: "weekly",
      },
      retentionDays: {
        type: Number,
        default: 30,
      },
    },

    // Theme Settings
    themeSettings: {
      primaryColor: {
        type: String,
        default: "#667eea",
      },
      secondaryColor: {
        type: String,
        default: "#764ba2",
      },
      darkMode: {
        type: Boolean,
        default: false,
      },
      customCSS: {
        type: String,
        default: "",
      },
    },

    // Last updated info
    lastUpdatedBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;

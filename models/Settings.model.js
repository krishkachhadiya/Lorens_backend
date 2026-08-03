const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: "" },
    websiteTitle: { type: String, default: "" },

    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },

    pagination: { type: String, default: "10" },

    /* Branding */
    logo: { type: String, default: "" },
    favicon: { type: String, default: "" },
    ogImage: { type: String, default: "" },

    /* Website Section Images */
    aboutImage: { type: String, default: "" },
    whyChooseUsImage: { type: String, default: "" },

    /* Social */
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    linkedin: { type: String, default: "" },

    /* SEO */
    copyright: { type: String, default: "" },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Settings", settingsSchema);``
import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minLength: 3,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      minLength: 10,
      trim: true,
    },
    basePrice: {
      type: Number,
      min: 0,
      required: true,
    },
    unitPrice: {
      type: Number,
      min: 0,
    },
    unit: {
      type: String,
      enum: ["item", "kg", "pot"],
      default: "item",
    },
    availableStock: {
      type: Number,
      min: 0,
      required: true,
    },
    soldAmount: {
      type: Number,
      default: 0,
    },
    stockAlert: {
      type: Number,
      default: 3,
    },
    imgCover: {
      type: String,
      required: true,
    },
    media: {
      type: [String],
      required: true,
    },
    categories: [
      {
        type: String,
        required: true,
      },
    ],
    dimension: {
      type: Object,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        review: String,
        rating: Number,
        upVote: Number,
        downVote: Number,
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
    reviewCount: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Public", "Hidden", "Deleted"],
      default: "Public",
    },
    expirationDate: {
      type: Date,
    },
    signedImgCover: {
      type: String,
      default: "",
    },
    signedMedia: {
      type: [String],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index({
  status: 1,
});
productSchema.index({
  sellerId: 1,
});
productSchema.index({
  categories: 1,
});
productSchema.index({ title: "text", description: "text" });

productSchema.pre("save", function (next) {
  // Slugify
  if (this.isModified("title")) {
    this.slug = slugify(this.title + "-" + Date.now(), {
      lower: true,
      strict: true,
    });
  }

  // Set unitPrice (add +10%)
  const unitPrice = (this.basePrice * 110) / 100;
  this.unitPrice = Math.round(unitPrice * 100) / 100;
  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;

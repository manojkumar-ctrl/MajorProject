const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");


const Listing = require("../models/listing.js");
const Review = require("../models/review.js"); // ✅ Make sure this exists
const {isLoggedIn,isOwner,validateReview}=require("../middleware.js");
const listingController=require("../controllers/listings.js");
const multer  = require('multer')
const {storage}=require("../cloudConfig.js");
const upload = multer({storage });
// Validation middleware
// Validation middleware

// INDEX Route - list all listings
router.get("/", wrapAsync(listingController.index));

// NEW Route - show form to create new listing
// routes/listing.js


//NEW route
router.get("/new", isLoggedIn,listingController.renderNewForm);

module.exports = router;


// CREATE Route - add new listing
router.post("/",isLoggedIn, upload.single("listing[Image]"),wrapAsync(listingController.createListing));

// SHOW Route - show details of a single listing
router.get("/:id", wrapAsync(listingController.showListing));

// EDIT Route - show edit form
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));

// UPDATE Route - update listing
router.put("/:id", isLoggedIn,
    isOwner,upload.single("listing[Image]"),
    wrapAsync(listingController.updateListing));

// DELETE Route - delete listing
router.delete("/:id", isLoggedIn,isOwner,wrapAsync(listingController.destoryListing));

// REVIEW ROUTES

// CREATE Review
router.post("/:id/reviews", validateReview, wrapAsync(async(req, res) => {
    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

// DELETE Review
router.delete("/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));

module.exports = router;

const express = require("express");
const router = express.Router();
const wrapAsync=require("../utils/wrapAsync.js")
const ExpressError=require("../utils/ExpressError.js")
const {ListingSchema,reviewSchema}=require("../schema.js");
const Review=require("../models/review.js");
const {validateReview,isLoggedIn, isreviewAuthor      }=require("../middleware.js");
const reviewController=require("../controllers/review.js");
// const validateReview = (req, res, next) => {
//     const { error } = reviewSchema.validate(req.body);
//     if (error) {
//         const errMsg = error.details.map(el => el.message).join(".");
//         throw new ExpressError(400, errMsg);
//     }
//     next();
// };


 router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview)
);

//delete review route

router.delete("/:reviewId",isLoggedIn,
  isreviewAuthor,
  wrapAsync(reviewController.deleteReview)
);

module.exports=router;

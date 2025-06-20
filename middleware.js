const Listing=require("./models/listing");
const Review=require("./models/review");

const ExpressError=require("./utils/ExpressError");
const {listingSchema,reviewSchema}=require("./schema.js");

module.exports.isLoggedIn=(req,res,next)=>{
      if (!req.isAuthenticated()) {
        req.session.redirectUrl=req.originalUrl;//redirecturl save
    req.flash("error", "You must be signed in to access this page.");
    return res.redirect("/login");
  }
  next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl=req.session.redirectUrl;
  }
  next();
};

// middleware.js
module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    // Save listing in request for later use if needed
    req.listing = listing;

    if (!listing.owner.equals(res.locals.currentUser._id)) {
        req.flash("error", "You don't have permission to do that");
        return res.redirect(`/listings/${id}`);
    }

    next(); // Only checking ownership here
};


module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(".");
        throw new ExpressError(400, errMsg);
    }
    next();
};


module.exports.isLoggedIn=(req,res,next)=>{
      if (!req.isAuthenticated()) {
        req.session.redirectUrl=req.originalUrl;//redirecturl save
    req.flash("error", "You must be signed in to access this page.");
    return res.redirect("/login");
  }
  next();
}

module.exports.isreviewAuthor= async (req, res, next) => {
    const { id , reviewId} = req.params;
    const review = await Review.findById(reviewId);

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    // Save listing in request for later use if needed
    req.listing = listing;

    if (!review.author.equals(res.locals.currentUser._id)) {
        req.flash("error", "You don't have permission to do that");
        return res.redirect(`/listings/${id}`);
    }

    next(); // Only checking ownership here
};

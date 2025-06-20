const Listing=require("../models/listing");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};


module.exports.renderNewForm=(req, res) => {
  res.render("listings/new.ejs");
}

module.exports.showListing=async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate
    ({
        path:"reviews",
        populate:{
            path:"author",
        },
    }).populate("owner");
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }
    res.render("listings/show.ejs", { listing });
}

module.exports.createListing=async (req, res) => {
    let url=req.file.path;
    let filename=req.file.filename;
    if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data for listing");
    }
    const newListing = new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    await newListing.save();
    req.flash("success", "new listing created");
    res.redirect("/listings");
}

module.exports.renderEditForm=async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        res.redirect("/listings");
    }
    let originalImageUrl =listing.image.url;
   originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250,");
    res.render("listings/edit.ejs", { listing,originalImageUrl });
}

module.exports.updateListing=async (req, res) => {

    if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data for listing");
    }
    const { id } = req.params;
    
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if(typeof req.file!="undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
    }
    res.redirect(`/listings/${id}`);
}


module.exports.destoryListing=async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}
if(process.env.NODE_ENV!="production"
){
require('dotenv').config();
}

const express=require("express");
const    app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js")
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js")
const ExpressError=require("./utils/ExpressError.js")
const {ListingSchema,reviewSchema}=require("./schema.js");
const Review=require("./models/review.js");

const listings=require("./routes/listing.js");
const reviews=require("./routes/review.js");
const userRouter=require("./routes/user.js");

const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
//connecting database
// const MONGO_URL="mongodb://127.0.0.1:27017/mystay";   was for localhost 
const dburl=process.env.ATLASDB_URL;

const flash = require('connect-flash');
const session = require("express-session");
const MongoStore=require('connect-mongo');


const store=MongoStore.create({
    mongoUrl:dburl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*60*60,
})

store.on("error",()=>{
    console.log("error in mongo session store",err);
})
// Define session options
const sessionOptions = {
    store,
  secret: process.env.SECRET, // Use a strong secret in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
};



// Then use it
app.use(session(sessionOptions));



app.use(flash());

// Middleware to make flash messages available in templates

main().then(()=>{
    console.log("connected to DB");
}).catch(err=>{
    console.log(err);
})
async function main(){
    await mongoose.connect(dburl);
}
//setting up view engine
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));   //For req.paramas
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));




//then this for routing basic for calling 
// app.get("/",(req,res)=>{
//     res.send("Hi i am the root")
// })


app.use(session(sessionOptions));
app.use(flash())
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
   
    next();
});

// app.get("/demouser", async (req, res) => {
    //     try {
//         const existingUser = await User.findOne({ username: "delta-student1" });

//         if (existingUser) {
//             return res.send(`User already exists: ${existingUser.username}`);
//         }

//         const fakeUser = new User({
//             email: "student@gmail.com",
//             username: "delta-student"
//         });

//         const registeredUser = await User.register(fakeUser, "helloworld");
//         res.send(`User registered: ${registeredUser.username}`);
//     } catch (err) {
//         console.error("Error registering user:", err);
//         res.status(500).send("Internal Server Error");
//     }
// });

// app.use("/listings",listingRouter);
// app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(".");
        throw new ExpressError(400, errMsg);
    }
    next();
};

  app.use("/listings",listings);  

//Index route
   app.get("/listings",async(req,res)=>{
    const allListings= await Listing.find({});
    res.render("listings/index.ejs",{allListings});
})

//same for down bcz of error had to keep it up
   app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs")
})
//Show Route
   app.get("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
})




// //for new listings
//    app.get("/listings/new",(req,res)=>{
    //     res.render("listings/new.ejs")
    // })
    
    //now the above get request has been accepted and now 
    //to resposne we need to give something back
    //now we write code for that
    
    //Create Route
       app.post("/listings",wrapAsync(async(req,res,next)=>{
        if(!req.body.listing){
            throw new ExpressError(400,"send valid data for listing");
        }
        const newListing=new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
    })
);


//Edit Route
   app.get("/listings/:id/edit",async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing})
})


//update
   app.put("/listings/:id",async(req,res)=>{
    if(!req.body.listing){
        throw new ExpressError(400,"send valid data for listing");
    }
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
})

//delete routr
   app.delete("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
    
})


//For error handling
//    app.all("*",(req,res,next)=>{
//     next(new ExpressError(404,"Page Not Found!"));
// });


//    app.use((err,req,res,next) =>{
//     let {statusCode=500,message="Something went wrong"}=err;
//     res.render("error.ejs",{message});
// });

//first this
   app.listen(8080,()=>{
    console.log("server is listening to port 8080")
});


//REVIEW ROUTES


//saving reviews
   app.post("listings/:id/reviews",validateReview,wrapAsync(async(req,res)=>{
    let listing= await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
})
);

//delete review route

   app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
  let{id,reviewId}=req.params;
  await Listing.findByIdAndUpdate(id,{$pull:{reviews: reviewId}})
 await  Review.findByIdAndDelete(reviewId);

 res.redirect(`/listings/${id}`);
})
);


app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);



//testing listings



//    app.get("/testListing",async(req,res)=>{
//     let sampleListing=new Listing({
//         title:"My New Villa",
//         description:"By the beach",
//         price:1200,
//         location:"Bengaluru",
//         country:"India",
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successfull testing");
// });
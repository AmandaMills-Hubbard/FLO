var express = require('express');
var app = express();app.set('view engine', 'ejs');
module.exports = function(app, passport, db, multer, ObjectId) {

  // page routes
  app.get( "/", function(req, res){
    db.collection("stats").find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render("index.ejs", {
        stats: result
      })
    })
  });

  app.get('/login', function(req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile',
    failureRedirect : '/login',
    failureFlash : true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function(req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  app.get("/profile", isLoggedIn, function(req, res) {
    res.render("profile.ejs");
  });

  app.get( "/sci",function(req, res){
    let uId = ObjectId(req.session.passport.user)
    db.collection("users").findOne({'_id' : uId}, function(err, users) {
      if (err) throw err;
      db.collection("comments").find().sort({ vote: -1}).toArray((err, result) => {
        db.collection("replies").find().toArray( (err, rplResult) => {
          console.log(rplResult);


          if (err) return console.log(err)


          res.render("sci.ejs", {
            comments: result,
            users : users.local.username,
            replies : rplResult
          })
        })
      })
    });

  });
  // app.get( "/3D", function(req, res){
  //   db.collection("stats").find().toArray((err, result) => {
  //     if (err) return console.log(err)
  //     res.render("three.ejs", {
  //       stats: result
  //     })
  //   })
  // });

  app.get("/tech", function(req, res) {

    res.render("tech.ejs");
  });

  app.get("/engineering", function(req, res) {
    res.render("engi.ejs");
  });


  app.post("/comments", (req, res) => {
    let uId = ObjectId(req.session.passport.user)
    db.collection("users").findOne({'_id' : uId}, function(err, users) {
      db.collection("comments").save({username: users.local.username, msg: req.body.msg, vote: 0 }, (err, result) => {

        if (err) return console.log(err)
        console.log("saved to DB")
        res.redirect("/sci")

      })
    })
  });

  app.post("/reply", (req, res) => {
    // console.log(req.body);
    // console.log(req.user);
    let commentId = ObjectId(req.body.commentId)
    db.collection("replies").save({
      commentId : commentId,
      username :req.user.local.username,
      reply : req.body.reply
    } )
  })


  // app.get("/comments", (req, res) => {
  //   db.comments.find().sort({ vote: 1}).toArray((err, result) => {
  //     if (err) return console.log(err)
  //     res.send("sci.ejs", {
  //       users: result
  //     })
  // })})
  app.put('/vote', (req, res) => {
    console.log(req.body._id);
    let commentId = ObjectId(req.body._id);
    console.log(commentId);
    db.collection("comments")
    .findOneAndUpdate({_id: commentId}, {

      $inc: {
        vote:1
      }},
      {
        sort: {_id: -1},
        upsert: true
      },
      (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })
    app.put('/downvote', (req, res) => {
      console.log(req.body._id);
      let commentId = ObjectId(req.body._id);
      console.log(commentId);
      db.collection('comments')
      .findOneAndUpdate({_id: commentId}, {

        $inc: {
          vote: -1
        }},
        {
          sort: {_id: -1},
          upsert: true
        },
        (err, result) => {
          if (err) return res.send(err)
          res.send(result)
        })
      })


      //// code for multer upload picture for an article/ or post

// All articles PAGE =========================
  app.get( "/articles", function(req, res){
        db.collection("demo").find().toArray((err, result) => {
          if (err) return console.log(err)
          res.render("articles.ejs", {
            user: req.user,
            articles: result
          })
        })
      });

      // SET STORAGE
    var storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, 'public/images/uploads')
      },
      filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
      }
    })
    var upload = multer({ storage: storage });
/////// end
//Uploading files
app.post('/up', upload.single('file-to-upload'), (req, res, next) => {
  let uId = ObjectId(req.session.passport.user)
  db.collection('demo').save({posterId: uId, title: req.body.title, hero: req.body.hero, imgPath: 'images/uploads/' + req.file.filename}, (err, result) => {

    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/articles')
  })
});


/////end
      function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
        return next();

        res.redirect('/');
      }
    }

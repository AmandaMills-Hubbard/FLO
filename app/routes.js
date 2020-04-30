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
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  app.get("/profile", isLoggedIn, function(req, res) {
    let uId = ObjectId(req.session.passport.user)
    db.collection("users").findOne({'_id' : uId}, function(err, users) {
      res.render("profile.ejs", {
        users : users
      });
    })
  });

  app.get("/tech", function(req, res) {

    res.render("tech.ejs");
  });

  app.get( "/sci",function(req, res){
    let uId = ObjectId(req.session.passport.user)
    console.log(uId, "expect empty user");
    db.collection("users").findOne({'_id' : uId}, function(err, users) {
      if (err) throw err;
      db.collection("comments").find().sort({ vote: -1}).toArray((err, result) => {
        db.collection("replies").find().toArray( (err, rplResult) => {
          console.log(rplResult);
          if (err) return console.log(err)

          res.render("sci.ejs", {
            comments: result,
            users : users,
            replies : rplResult
          })
        })
      })
    });

  });

  app.delete('/messages', (req, res) => {

    db.collection('comments').findOneAndDelete({_id: ObjectId(req.body._id), msg: req.body.msg}, (err, result) => {//looks at messages collection,s finds and deletes.

      if (err) return res.send(500, err)//if error, send error
      res.send('Message deleted!')
    })
  })
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

    let commentId = ObjectId(req.body.commentId)
    db.collection("replies").save({
      commentId : commentId,
      username :req.user.local.username,
      reply : req.body.reply
    } )
    res.redirect("/sci")
  })

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

      app.get("/article/:id", function(req, res) {
        let postId = ObjectId(req.params.id)
        db.collection("demo").find({_id: postId}).toArray((err, result) => {
          db.collection("commentA").find({postId: req.params.id}).toArray((err, resultC) => {
            db.collection("replyA").find({postId: req.params.id}).toArray( (err, rplResult) => {

              if (err) return console.log(err)
              res.render("indie.ejs", {
                demo: result,
                commentA : resultC,
                replyA : rplResult,
                users : req.user
              })

            })
          })
        })
      });
      app.post("/commentA", (req, res) => {
        let uId = ObjectId(req.session.passport.user)
        console.log(uId);
        console.log(req.body);
        let postId = req.body.postId
        console.log(postId);
        db.collection("users").findOne({'_id' : uId}, function(err, users) {
          db.collection("commentA").save({username: users.local.username, msg: req.body.msg, postId: req.body.postId}, (err, result) => {

            if (err) return console.log(err)
            console.log("saved to DB")
            res.redirect(`/article/${postId}`)

          })
        })
      });

      app.post("/replyA", (req, res) => {
        let postId = req.body.postId
        console.log(req.body);
        let commentAId =req.body.commentAId
        db.collection("replyA").save({
          commentAId : commentAId,
          username :req.user.local.username,
          replyA : req.body.replyA,
          postId : req.body.postId
        } )
        res.redirect(`/article/${postId}`)
      })

      //// code for multer upload picture for an article/ or post

      app.get( "/post", function(req, res){
        res.render("post.ejs")

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

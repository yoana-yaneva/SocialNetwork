const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostsSchema');

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", async (req, res, next) => {
    let results = await getPosts({});
    res.status(200).send(results);
})

router.get("/:id", async (req, res, next) => {

    let postId = req.params.id;

    let results = await getPosts({ _id: postId });
    results = results[0];
    res.status(200).send(results);
})

router.post("/", async (req, res, next) => {
    if (!req.body.content) {
        console.log("Content param not send with request");
        return res.sendStatus(400);
    }

    let postData = {
        content: req.body.content,
        postedBy: req.session.user
    }

    if(req.body.replyTo) {
        postData.replyTo = req.body.replyTo;
    }

    Post.create(postData)
        .then(async (newPost) => {
            newPost = await User.populate(newPost, { path: "postedBy" })

            res.status(201).send(newPost);
        })
        .catch((err) => {
            console.log(err);
            res.sendStatus(400);
        })
})

router.put("/:id/like", async (req, res, next) => {

    let postId = req.params.id;
    let userId = req.session.user._id;

    let isLiked = req.session.user.likes && req.session.user.likes.includes(postId);

    let option = isLiked ? "$pull" : "$addToSet";

    //insert user like
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { likes: postId } }, { new: true })
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        })


    //insert posts like
    let post = await Post.findByIdAndUpdate(postId, { [option]: { likes: userId } }, { new: true })
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        })

    res.status(200).send(post)
})

router.post("/:id/retweet", async (req, res, next) => {

    let postId = req.params.id;
    let userId = req.session.user._id;

    // Try and delete retweet
    let deletedPost = await Post.findOneAndDelete({ postedBy: userId, retweetData: postId })
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        });

    let option = deletedPost != null ? "$pull" : "$addToSet";

    let repost = deletedPost;

    if (repost == null) {
        repost = await Post.create({ postedBy: userId, retweetData: postId })
            .catch(err => {
                console.log(err);
                res.sendStatus(400);
            });
    }

    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { retweet: repost._id } }, { new: true })
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        })

    //insert user like
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { likes: postId } }, { new: true })
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        })


    //insert posts like
    let post = await Post.findByIdAndUpdate(postId, { [option]: { retweetUsers: userId } }, { new: true })
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        })

    res.status(200).send(post)
})

async function getPosts(filter) {
    let results = await Post.find(filter)
        .populate("postedBy")
        .populate("retweetData")
        .populate("replyTo")
        .sort({ "createdAt": -1 })
        .catch(err => {
            console.log(err);
        })
    
        results = await User.populate(results, { path: "replyTo.postedBy" });
    return results = await User.populate(results, { path: "retweetData.postedBy" });
}

module.exports = router;
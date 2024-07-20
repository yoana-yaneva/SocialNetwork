$("#postTextarea, #replyTextarea").keyup((event) => {
    let textbox = $(event.target);
    let value = textbox.val().trim();

    let isModal = textbox.parents(".modal").length == 1;

    let submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");

    if (submitButton.length == 0) {
        return alert("No submit button");
    }

    if (value == "") {
        submitButton.prop("disabled", true);
        return;
    }

    submitButton.prop("disabled", false);
})

$("#submitPostButton, #submitReplyButton").click(() => {
    let button = $(event.target);

    let isModal = button.parents(".modal").length == 1;
    let textbox = isModal ? $("#replyTextarea") : $("#postTextarea");

    let data = {
        content: textbox.val()
    }

    if (isModal) {
        let id = button.data().id;
        if (id == null) return alert("Button id is null");
        data.replyTo = id;
    }

    $.post("/api/posts", data, (postData) => {

        if (postData.replyTo) {
            location.reload();
        } else {
            let html = createPostHtml(postData);
            $(".postsContainer").prepend(html);
            textbox.val("");
            button.prop("disabled", true);
        }
    })
})

$("#replyModal").on("show.bs.modal", (event) => {
    let button = $(event.relatedTarget);
    let postId = getPostIdFromElement(button);

    $("#submitReplyButton").data("id", postId);

    $.get("/api/posts/" + postId, results => {
        outputPosts(results, $("#originalPostContainer"))
    })
})

$("#replyModal").on("hidden.bs.modal", () => {
    $("#originalPostContainer").html("");
})


$(document).on("click", ".likeButton", (event) => {
    let button = $(event.target);
    let postId = getPostIdFromElement(button);

    if (postId === undefined) {
        return;
    };

    $.ajax({
        url: `/api/posts/${postId}/like`,
        type: "PUT",
        success: (postData) => {
            button.find("span").text(postData.likes.length || "");

            if (postData.likes.includes(userLoggedIn._id)) {
                button.addClass("active")
            } else {
                button.removeClass("active")
            }
        }
    })
})

$(document).on("click", ".retweetButton", (event) => {
    let button = $(event.target);
    let postId = getPostIdFromElement(button);

    if (postId === undefined) {
        return;
    };

    $.ajax({
        url: `/api/posts/${postId}/retweet`,
        type: "POST",
        success: (postData) => {
            button.find("span").text(postData.retweetUsers.length || "");

            if (postData.retweetUsers.includes(userLoggedIn._id)) {
                button.addClass("active")
            } else {
                button.removeClass("active")
            }
        }
    })
})

function getPostIdFromElement(element) {
    let isRoot = element.hasClass("post")
    let rootElement = isRoot == true ? element : element.closest(".post");
    let postId = rootElement.data().id;

    if (postId === undefined) return alert("Post id undefined");

    return postId;
}

function createPostHtml(postData) {

    if (postData == null) return alert("Post object is null");

    let isRetweet = postData.retweetData !== undefined;
    let retweetedBy = isRetweet ? postData.postedBy.username : null;
    postData = isRetweet ? postData.retweetData : postData;

    let postedBy = postData.postedBy;

    if (postedBy._id === undefined) {
        return console.log("User object hot populated")
    }

    let displayName = postedBy.firstName + " " + postedBy.lastName;
    let timestamp = timeDifference(new Date(), new Date(postData.createdAt));

    let likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
    let retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : ""

    let retweetText = '';
    if (isRetweet) {
        retweetText = `<i class="fa-solid fa-retweet"></i><span>Retweeted by <a href ='/profile/${retweetedBy}'>${retweetedBy}</a></span>`
    }

    let replyFlag = "";
    if (postData.replyTo) {

        if (!postData.replyTo._id) {
            return alert("Reply to is not populated");
        }
        else if (!postData.replyTo.postedBy._id) {
            return alert("Posted by is not populated");
        }

        let replyToUsername = postData.replyTo.postedBy.username;
        replyFlag = `<div class='replyFlag'>
                        Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}<a>
                    </div>`;

    }

    return `<div class='post' data-id='${postData._id}'>
        <div class='postActionContainer'>
            ${retweetText}
        </div>
        <div class='mainContentContainer'>
            <div class='userImageContainer'>
                <img src='${postedBy.profilePic}'>
            </div>
            <div class='postContentContainer'>
                <div class='header'>
                    <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                    <span class='username'>@${postedBy.username}</span>
                    <span class='date'>${timestamp}</span>
                </div>
                ${replyFlag}
                <div class='postBody'>
                    <span>${postData.content}</span>
                </div>
                <div class='postFooter'>
                    <div class='postButtonContainer'>
                        <button data-toggle='modal' data-target='#replyModal'>
                            <i class="fa-solid fa-comment"></i>
                        </button>
                    </div>
                    <div class='postButtonContainer green'>
                        <button class='retweetButton ${retweetButtonActiveClass}'>
                            <i class="fa-solid fa-retweet"></i>
                            <span>${postData.retweetUsers.length || ""}</span>
                        </button>
                    </div>
                    <div class='postButtonContainer red'>
                        <button class='likeButton ${likeButtonActiveClass}'>
                            <i class="fa-solid fa-heart"></i>
                            <span>${postData.likes.length || ""}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>`
}

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if (elapsed / 1000 < 30) return "Just now";

        return Math.round(elapsed / 1000) + ' seconds ago';
    }

    else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minutes ago';
    }

    else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hours ago';
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed / msPerDay) + ' days ago';
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed / msPerMonth) + ' months ago';
    }

    else {
        return Math.round(elapsed / msPerYear) + ' years ago';
    }
}

function outputPosts(results, container) {
    container.html("");

    if (!Array.isArray(results)) {
        results = [results];
    }

    results.forEach(result => {
        let html = createPostHtml(result);
        container.append(html)
    });

    if (results.length == 0) {
        container.append("<span class='noResults'>Nothing to see here.</span>")
    }
}
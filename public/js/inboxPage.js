$(document).ready(() => {
    $.get("/api/chats", (data, status, xhr) => {
        if (xhr.status == 400) {
            alert("Can't het chat list")
        } else {
            outputChatList(data, $(".resultsContainer"))
        }
    })
})

function outputChatList(chatList, container) {
    chatList.forEach(chat => {
        let html = createChatHtml(chat);
        container.append(html)
    })

    if (chatList.length == 0) {
        container.append("<span class='noResults'>Nothing to see here. You can start a new chat.</span>")
    }
}


function createChatHtml(chatData) {

    let chatName = getChatName(chatData);
    let image = getChatImageElement(chatData);
    let lastMessage = "Last message"

    return `<a href='/messages/${chatData._id}' class='resultListItem'>
            ${image}  
            <div class='resultsDetailsContainer'>
                    <span class='heading ellipsis'>${chatName}</span>
                    <span class='subText ellipsis'>${lastMessage}</span>
                </div>
            </a>`

}

function getChatName(chatData) {
    let chatName = chatData.chatName;

    if (!chatName) {
        let otherChatUsers = getOtherChatUsers(chatData.users);
        let namesArr = otherChatUsers.map(user => user.firstName + " " + user.lastName)
        chatName = namesArr.join(", ")
    }

    return chatName;

}

function getOtherChatUsers(users) {
    if (users.length == 1) return users;

    return users.filter((user) => {
        return user._id != userLoggedIn._id
    })
}

function getChatImageElement(chatData) {
    let otherChatUsers = getOtherChatUsers(chatData.users);
    let groupChatClass = "";
    let chatImg = getUserChatImgElement(otherChatUsers[0]);

    if (otherChatUsers.length > 1) {
        groupChatClass = "groupChatImg";
        chatImg += getUserChatImgElement(otherChatUsers[1]);
    }

    return `<div class='resultsImageContainer ${groupChatClass}'>${chatImg}</div>`
}

function getUserChatImgElement(user) {
    if (!user || !user.profilePic) {
        return alert("User passed into func is invalid")
    }

    return `<img src='${user.profilePic}' alt='User profile pic'>`;
}
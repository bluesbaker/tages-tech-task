/**
 * The technical task for the TAGES
 * by Bluesbaker <Gordienko K.S.>
 */

const axios = require('axios');

/**
 * Get user info by id
 * @param {number} userId - user id
 * @returns user info
 */
async function getUser(userId) {
    let user = await axios(`http://jsonplaceholder.typicode.com/users?id=${userId}`)
    .then(res => {
        return res.data[0];
    })
    .catch(err => {
        return new Error(err.message);
    });

    return user;
}

/**
 * Get user list
 * @param {number} limit - quantity users or 0(unlimit)
 * @returns - user list
 */
async function getUsers(limit) {
    let users = [];

    // get all users
    if(!limit) {
        users = await axios('http://jsonplaceholder.typicode.com/users')
        .then(res => {
            return res.data;
        })
        .catch(err => {
            return new Error(err.message);
        });
    }
    // or limited quantity users
    else {
        for(let i = 1; i <= limit; i++) {
            let user = await getUser(i);
            user && users.push(user);
        }
    }

    return users;
}

/**
 * Get post list by user
 * @param {number} userId - user id
 * @param {number} limit - quantity posts or 0(unlimit)
 * @returns post list by user
 */
async function getPosts(userId, limit) {
    let posts = await axios(`http://jsonplaceholder.typicode.com/posts?userId=${userId}`)
    .then(res => {
        return res.data;
    })
    .catch(err => {
        return new Error(err.message);
    });

    return (limit && posts.slice(0, limit)) || posts;
}

/**
 * Get comment list from post
 * @param {number} postId - post id
 * @param {number} limit - quantity comments or 0(unlimit)
 * @returns comment list from post
 */
async function getComments(postId, limit) {
    let comments = await axios(`http://jsonplaceholder.typicode.com/comments?postId=${postId}`)
    .then(res => {
        return res.data;
    })
    .catch(err => {
        return new Error(err.message);
    });

    return (limit && comments.slice(0, limit)) || comments;
}

/**
 * Get user list with correct info
 * @param {string} specialUserName - special user with comments of posts
 * @param {number} usersLimit - quantity users
 * @param {number} postsLimit - quantity posts
 * @param {number} commentsLimit - quantity comments
 * @returns user list with correct info
 */
async function getCorrectUsers(specialUserName, usersLimit = 0, postsLimit = 0, commentsLimit = 0) {
    let users = await getUsers(usersLimit);  

    // correcting users
    let correctUsers = users.map(user => {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            address: `${user.address.city}, ${user.address.street}, ${user.address.suite}`,
            website: `https://${user.website}`,
            company: user.company.name
        };
    });

    // correcting posts from user*
    for(let i = 0; i < correctUsers.length; i++) {
        let user = correctUsers[i];
        let posts = await getPosts(user.id, postsLimit);

        user.posts = posts.map(post => {
            return {
                id: post.id,
                title: post.title,
                title_crop: post.title.slice(0, 20) + '...',
                body: post.body
            };
        });

        // add comments of posts by special user
        if(!!specialUserName.trim() && user.name === specialUserName) {
            for(let i = 0; i < user.posts.length; i++) {
                user.posts[i].comments = await getComments(user.posts[i].id, commentsLimit);            
            }
        }
    }

    return correctUsers;
};

// ...and output in console
let users = getCorrectUsers('Ervin Howell', 10)
.then(result => {
    console.log(JSON.stringify(result, null, 2))
})
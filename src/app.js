
const apiUrl = 'https://jsonplaceholder.typicode.com';

const fetchData = async (url) => {
  const response = await fetch (url);
  return await response.json ();
}

const GetUsers = async () => {
  const usersData = await fetchData (`${ apiUrl }/users`);
  return await Promise.all (usersData.map (async (user) => {
    const posts = await fetchData (`${ apiUrl }/posts?userId=${ user.id }`);
    const allComments = await Promise.all(posts.map(async post => {
      const postComments = await fetchData(`${apiUrl}/comments?postId=${post.id}`);
      return postComments.map(comment => {
        return {
          id: comment.id,
          postId: comment.postId,
          name: comment.name,
          body: comment.body
        };
      });
    }));

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      comments: allComments.flat(),
      posts: posts.map (posts => {
        return {
          id: posts.id,
          title: posts.title,
          body: posts.body
        }
      }),
    };
  }));
}

const lastQuestion = async (postId) => {
  const [post, comments] = await Promise.all([
    fetchData(`${apiUrl}/posts/${postId}`),
    fetchData(`${apiUrl}/comments?postId=${postId}`)
  ]);
  return {
    ...post,
    comments
  }
}



(async () => {
  try {
    const users  = await GetUsers ();
    const filterUser = users.filter(user => user.comments.length >= 3)
    const usersWithCounts = users.map(user => {
      return {
        ...user,
        commentsCount: user.comments.length,
        postsCount: user.posts.length
      }
    })
    const sortUser = usersWithCounts.reduce((maxUser, currentUser) => {
      return currentUser.commentsCount + currentUser.postsCount > maxUser.commentsCount + maxUser.postsCount
        ? currentUser
        : maxUser;
    }, usersWithCounts[0]);

    const sortedUsers = usersWithCounts.sort((a, b) => b.postsCount - a.postsCount);

    const lastQuestionResult = await lastQuestion(1);
    console.log (lastQuestionResult)
  } catch (e){
    console.log("Got an error here")
  }
})();
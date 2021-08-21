const BASE_URL = 'https://jsonplace-univclone.herokuapp.com';

function fetchData(url) {
  return fetch(url).then(function (response) {
    return response.json();
  }).catch(function (error) {
    console.error(error);
  });
}//end helper function

function fetchUsers() {
    return fetchData(`${ BASE_URL }/users`);
    
}//end function fetchUsers

fetchUsers().then(function (data) {
  console.log(data);
});

function renderUser(user) {
  const element =$(`
      <div class="user-card">
        <header>
          <h2> ${user.name}</h2>
        </header>
        <section class="company-info">
          <p><b>Contact:</b> ${user.email}</p>
          <p><b>Works for:</b> ${user.company.name}</p>
          <p><b>Company creed:</b> ${user.company.catchPhrase}</p>
        </section>
        <footer>
          <button class="load-posts">POSTS BY ${user.username}</button>
          <button class="load-albums">ALBUMS BY ${user.username}</button>
        </footer>
      </div>
  `)
  return element.data('user', user) 

}//end function renderUser

function renderUserList(userList) {
  userList.forEach(user=>{
    $("#user-list").append(renderUser(user));
})
}//function end renderUserList

function fetchUserAlbumList(userId) {
  return fetchData(`${ BASE_URL }/users/${ userId }/albums?_expand=user&_embed=photos`);
 
}//end function fetchUserAlbumList


function renderAlbum(album) {
  const element = $(`
        <div class="album-card">
        <header>
          <h3>${album.title}, by ${album.user.username} </h3>
        </header>
        <section class="photo-list">
        
        </section>
      </div>
  `)
      const albumCardElement = element.find('.photo-list');

      album.photos.forEach(function (photo) {
        albumCardElement.append( renderPhoto(photo) );
      });

  return element;
}//end function renderAlbum

function renderPhoto(photo) {
  const element = $(`
        <div class="photo-card">
        <a href="${photo.url}" target="_blank">
          <img src="${photo.thumbnailUrl}">
          <figure>${photo.title}</figure>
        </a>
      </div>
  
  `)
  return element;
}

function renderAlbumList(albumList) {
  $("#app section.active").removeClass('active');
  $("#album-list").addClass('active').empty();
  
  albumList.forEach(function (album) {
    $("#album-list").append( renderAlbum(album) );
  }); 
 
}//end function renderAlbumList


function fetchUserPosts(userId) {
  return fetchData(`${ BASE_URL }/users/${ userId }/posts?_expand=user`);
}//end function fetchUserPosts

function fetchPostComments(postId) {
  return fetchData(`${ BASE_URL }/posts/${ postId }/comments`);

}//end function fetchPostComments

function setCommentsOnPost(post) {
  if (post.comments) {
    return Promise.reject(null);
  }

  return fetchPostComments(post.id).then(function (comments) {
    post.comments = comments;
    return post;
  });

}//end function setCommentsOnPost

function renderPost(post) {
  const element = $(`
      <div class="post-card">
      <header>
        <h3>${post.title}</h3>
      </header>
      <p>${post.body}</p>
      <footer>
        <div class="comment-list"></div>
        <a href="#" class="toggle-comments">(<span class="verb">show</span> comments)</a>
      </footer>
    </div>
  `)

  return element.data('post', post);

}//end function renderPost

function renderPostList(postList) {

  $("#app section.active").removeClass('active');
  $("#post-list").addClass('active').empty();
  
  postList.forEach(function (post) {
    $("#post-list").append( renderPost(post) );
  }); 

}//end function renderPostList

function toggleComments(postCardElement) {
  const footerElement = postCardElement.find('footer');

  if (footerElement.hasClass('comments-open')) {
    footerElement.removeClass('comments-open');
    footerElement.find('.verb').text('show');
  } else {
    footerElement.addClass('comments-open');
    footerElement.find('.verb').text('hide');
  }
}//end function toggleComments

$('#post-list').on('click', '.post-card .toggle-comments', function () {
  const postCardElement = $(this).closest('.post-card');
  const post = postCardElement.data('post');
  const commentList = postCardElement.find('.comment-list');
  setCommentsOnPost(post)
    //console.log(post)
    .then(function (post) {
      console.log('building comments for the first time...', post);
     post.comments.forEach (comment=>{
      commentList.prepend($(`<h3> ${comment.body} ${comment.email}</h3>`))
     })
    
     toggleComments(postCardElement);

    })
    .catch(function () {
      console.log('comments previously existed, only toggling...', post);
    
      toggleComments(postCardElement);

    });
});


$('#user-list').on('click', '.user-card .load-posts', function () {
  const user = $(this).closest('.user-card').data('user');
  // render posts for this user
  fetchUserPosts(user.id)
    .then(renderPostList);
});

$('#user-list').on('click', '.user-card .load-albums', function () {
  const user = $(this).closest('.user-card').data('user');
  fetchUserAlbumList(user.id)
  .then(renderAlbumList);
});

fetchUserAlbumList(1).then(function (albumList) {
  //console.log(albumList);
});

fetchUserAlbumList(1).then(renderAlbumList);

function bootstrap() {
  fetchUsers().then(renderUserList);
}//end function bootstrap

bootstrap();
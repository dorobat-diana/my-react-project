import React, { useEffect, useState, useRef, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import '../css_styling/container.css';
import '../css_styling/button.css';
import '../css_styling/table.css';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import DeleteUserModal from './modal-delete';
import DeletePostModal from './modal-delete-post';
import UserService, { socket } from '../Service/Service';
import PostService, { socket_post } from '../Service/Service_posts';
import { useNavigate } from "react-router-dom";

UserService.connect();
PostService.connect();

function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalPostOpen, setIsModalPostOpen] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [pageSize, setPageSize] = useState(50);
  const [postPageSize, setPostPageSize] = useState(50);
  const [curPage, setCurPage] = useState(1);
  const [curPostPage, setCurPostPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [usernames, setUsernames] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [authenticatedUserId, setAuthenticatedUserId] = useState(null);
  const observer = useRef();

  useEffect(() => {
    async function fetchData() {
      try {
        const { users, totalPages } = await UserService.getAllUsers(curPage, pageSize);
        setData(users);
        setTotalPages(totalPages);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }

    async function fetchAuthenticatedUser() {
      const token = localStorage.getItem('token');
      try {
        const userId = await UserService.getAuthenticatedUserId(token);
        setAuthenticatedUserId(userId);
      } catch (error) {
        console.error('Error fetching authenticated user ID:', error);
        if (authenticatedUserId !== null) {
          localStorage.removeItem('token');
          setAuthenticatedUserId(null);
          alert('Your session has expired. Please log in again.');
          navigate('/');
        }
      }
    }

    async function fetchDataPosts() {
      const fetchedPosts = await PostService.getUserPosts(curPostPage, postPageSize);
      //const fetchedPosts = await PostService.getAllPosts(curPostPage, postPageSize);
      const userNamesMap = {};
      for (const post of fetchedPosts) {
        const user = await UserService.getUser(post.userid);
        userNamesMap[post.userid] = user ? user.name : 'Unknown';
      }
      const postsWithUsernames = fetchedPosts.map(post => ({
        ...post,
        username: userNamesMap[post.userid]
      }));
      setPosts(postsWithUsernames);
    }

    fetchDataPosts();
    fetchData();
    fetchAuthenticatedUser();

    socket.addEventListener('message', (event) => {
      const message = event.data;
      if (message === 'new user added') {
        fetchData();
      }
      if (message === 'new post added') {
        fetchDataPosts();
      }
    });

    setInterval(() => {
      UserService.verifyConnection();
      PostService.verifyPostconnection();
      fetchAuthenticatedUser();
    }, 10000);

    return () => {
      socket.removeEventListener('message', null);
    };
  }, []);

  console.log('authenticatedUserId:', authenticatedUserId);

  const fetchMorePosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextPage = curPostPage + 1;
      const fetchedPosts = await PostService.getUserPosts(nextPage, postPageSize);
      //const fetchedPosts = await PostService.getAllPosts(nextPage, postPageSize);
      if (fetchedPosts.length > 0) {
        const userNamesMap = {};
        for (const post of fetchedPosts) {
          const user = await UserService.getUser(post.userid);
          userNamesMap[post.userid] = user ? user.name : 'Unknown';
        }
        const postsWithUsernames = fetchedPosts.map(post => ({
          ...post,
          username: userNamesMap[post.userid]
        }));
        setPosts(prevPosts => [...prevPosts, ...postsWithUsernames]);
        setCurPostPage(nextPage);
      }
    } catch (error) {
      console.error('Error fetching more posts:', error);
    }
    setIsLoading(false);
  }, [curPostPage, postPageSize]);

  const fetchMoreUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextPage = curPage + 1;
      const { users: newUsers } = await UserService.getAllUsers(nextPage, pageSize);
      if (newUsers.length > 0) {
        setData(prevData => [...prevData, ...newUsers]);
        setCurPage(nextPage);
      }
    } catch (error) {
      console.error('Error fetching more users:', error);
    }
    setIsLoading(false);
  }, [curPage, pageSize]);

  const logout = () => {
    localStorage.removeItem('token');
    setAuthenticatedUserId(null);
    alert('You have been logged out.');
    navigate('/');
  };

  const handleDelete = (id) => {
    setSelectedUserId(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await UserService.deleteUser(selectedUserId);
      const userPosts = posts.filter((post) => post.userid === selectedUserId);
      await Promise.all(userPosts.map((post) => PostService.deletePost(post.id)));
      setDeleteSuccess(true);
      setIsModalOpen(false);
      const newData = data.filter((user) => user.id !== selectedUserId);
      setData(newData);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCloseModal = () => {
    setSelectedUserId(null);
    setIsModalOpen(false);
  };

  const handleDeletePost = (id) => {
    setSelectedPostId(id);
    setIsModalPostOpen(true);
  };

  const handleConfirmDeletePost = async () => {
    try {
      await PostService.deletePost(selectedPostId);
      setDeleteSuccess(true);
      setIsModalPostOpen(false);
      const newPosts = posts.filter((post) => post.id !== selectedPostId);
      setPosts(newPosts);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCloseModalPost = () => {
    setSelectedPostId(null);
    setIsModalPostOpen(false);
  };

  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    const callback = (entries) => {
      if (entries[0].isIntersecting) {
        fetchMoreUsers();
        fetchMorePosts();
      }
    };
    observer.current = new IntersectionObserver(callback);
    observer.current.observe(document.querySelector('#infinite-scroll-trigger'));
  }, [fetchMoreUsers, fetchMorePosts]);

  return (
    <div className='container'>
    <div className="row">
      <div className="column">
        <h1 className='text-primary'>User List</h1>
        <Link to="/Create" className='button2'>Create +</Link>
        <table className='table'>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Age</th>
              <th>Posts</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
          {data.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.age}</td>
              <td>{user.postCount}</td>
              <td>
                <Link to={`/Update/${user.id}`} className='button2'>Update</Link>
                <Button className='button2' onClick={() => handleDelete(user.id)}>Delete</Button>
                {authenticatedUserId === user.id ? (
                  <Link to={`/View/${user.id}`} className='button2'>View</Link>
                ) : (
                  <Button className='button2' onClick={() => alert('This is confidential information')}>View</Button>
                )}
              </td>
            </tr>
          ))}
          </tbody>
        </table>
        {isLoading && <p>Loading...</p>}

<Link to={`/status`} className='button2'>Status</Link>
<Link to={`/Chart`} className='button2'>Chart</Link>
<DeleteUserModal
  open={isModalOpen}
  onClose={handleCloseModal}
  onConfirm={handleConfirmDelete}
/>
      </div>
      <div className="column">
        <h1 className='text-primary'>Post List</h1>
        <Link
        to={`/posts/create?curPage=${curPage}&pageSize=${pageSize}`}
        className='button2'
      >
        Create Post+
      </Link>
        <table className='table'>
          <thead>
            <tr>
              <th>User</th>
              <th>Caption</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
          {posts.map((post) => (
            <tr key={post.id}>
              <td>{post.username}</td>
              <td>{post.caption}</td>
              <td>{post.Date}</td>
              <td>
                <Link to={`/posts/update/${post.id}`} className='button2'>Update</Link>
                <Button className='button2' onClick={() => handleDeletePost(post.id)}>Delete</Button>
                <Link to={`/posts/view/${post.id}`} className='button2'>View</Link>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
        {isLoading && <p>Loading...</p>}
      <Button onClick={logout}>Logout</Button>
      <DeletePostModal
        open={isModalPostOpen}
        onClose={handleCloseModalPost}
        onConfirm={handleConfirmDeletePost}
      />
      <div id="infinite-scroll-trigger"></div>
      </div>
    </div>
  </div>
  
  );
}

export default Home;

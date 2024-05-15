import React, { useEffect,useState,useRef} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import '../css_styling/container.css'
import '../css_styling/button.css'
import '../css_styling/table.css'
import { Link } from 'react-router-dom'
import { Button} from 'react-bootstrap'; 
import DeleteUserModal from './modal-delete'
import DeletePostModal from './modal-delete-post'
import UserService,{socket} from '../Service/Service'
import PostService,{socket_post} from '../Service/Service_posts';
import Dropdown from 'react-bootstrap/Dropdown';
import { set } from 'mongoose';
import { useNavigate } from "react-router-dom";

UserService.connect();
PostService.connect();
 function Home() {
  const navigate = useNavigate();
    const [data, setData] = useState([])
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
  const [showMoreButton, setShowMoreButton] = useState(true);
  const tableRef = useRef();
  const [authenticatedUserId, setAuthenticatedUserId] = useState(null); // Change here
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
         // Check token expiry
    const token = localStorage.getItem('token');
    try {
      const userId = await UserService.getAuthenticatedUserId(token);
      setAuthenticatedUserId(userId);
      
    } catch (error) {
      console.error('Error fetching authenticated user ID:', error);
      // If token has expired or invalid, log out the user

      if (authenticatedUserId !== null){

        localStorage.removeItem('token');
        setAuthenticatedUserId(null);
        alert('Your session has expired. Please log in again.');
        navigate('/');
    }
    }
      }
      async function fetchDataPosts() {
        //const fetchedPosts = await PostService.getAllPosts(curPostPage, postPageSize);
        const fetchedPosts= await PostService.getUserPosts(curPostPage, postPageSize);
        // Fetch usernames for all users and store them
        const userNamesMap = {};
        for (const post of fetchedPosts) {
          const user = await UserService.getUser(post.userid);
          userNamesMap[post.userid] = user ? user.name : 'Unknown';
        }
      
        // Combine posts with usernames
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
            // If message is 'new_user_added', fetch new data
            fetchData();
          }
          if (message === 'new post added') {
            // If message is 'new_post_added', fetch new data
            fetchDataPosts();
          }
        });
        setInterval(() => {
          UserService.verifyConnection();
          PostService.verifyPostconnection();
          fetchAuthenticatedUser();
        }, 10000); // Adjust the interval as needed
    
        return () => {
          socket.removeEventListener('message',null);
        };
        
    
      }, [])

      console.log('authenticatedUserId:', authenticatedUserId);
      const fetchMorePosts = async () => {
        setIsLoading(true);
        try {
          const nextPage = curPostPage + 1;
          //const fetchedPosts = await PostService.getAllPosts(nextPage, postPageSize);
          const fetchedPosts= await PostService.getUserPosts(nextPage, postPageSize);
          if (fetchedPosts.length > 0) {
            // Fetch usernames for all users and store them
            const userNamesMap = {};
            for (const post of fetchedPosts) {
              const user = await UserService.getUser(post.userid);
              userNamesMap[post.userid] = user ? user.name : 'Unknown';
            }
            // Combine posts with usernames
            const postsWithUsernames = fetchedPosts.map(post => ({
              ...post,
              username: userNamesMap[post.userid]
            }));
            setPosts(prevPosts => [...prevPosts, ...postsWithUsernames]);
            setCurPostPage(nextPage);
          } else {
            setShowMoreButton(false); // Hide the button if there are no more posts to load
          }
        } catch (error) {
          console.error('Error fetching more posts:', error);
        }
        setIsLoading(false);
      };
    
      const fetchMoreUsers = async () => {
        setIsLoading(true);
        try {
          const nextPage = curPage + 1;
          const { users: newUsers } = await UserService.getAllUsers(nextPage, pageSize);
          if (newUsers.length > 0) {
            setData(prevData => [...prevData, ...newUsers]);
            setCurPage(nextPage);
          } else {
            setShowMoreButton(false); // Hide the button if there are no more users to load
          }
        } catch (error) {
          console.error('Error fetching more users:', error);
        }
        setIsLoading(false);
      };
      const logout = () => {
        localStorage.removeItem('token');
        setAuthenticatedUserId(null);
        alert('You have been logged out.');
        navigate('/');
      };
      
    const handlePostPageSizeChange =async  (size) => {
      setPostPageSize(size);
      setCurPostPage(1);
      try {
        const fetchedPosts = await PostService.getAllPosts(1, size);
                  // Fetch usernames for all users and store them
        const userNamesMap = {};
        for (const post of fetchedPosts) {
          const user = await UserService.getUser(post.userid);
          userNamesMap[post.userid] = user ? user.name : 'Unknown';
        }
      
        // Combine posts with usernames
        const postsWithUsernames = fetchedPosts.map(post => ({
          ...post,
          username: userNamesMap[post.userid]
        }));
        setPosts(postsWithUsernames);
        }
      catch (error) {
        console.error('Error fetching posts:', error);
      }

    };
  
    
;
    const handleDelete = (id) => {
        setSelectedUserId(id);
        setIsModalOpen(true);
      };
      const handleConfirmDelete = async () => {
        try {
          await UserService.deleteUser(selectedUserId);
          // Delete the posts associated with the user
          const userPosts = posts.filter((post) => post.userid === selectedUserId);
          await Promise.all(userPosts.map((post) => PostService.deletePost(post.id)));
          
          setDeleteSuccess(true);
          setIsModalOpen(false);
          //render the screen
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
    const handleDeletePost = async (id) => {
      setSelectedPostId(id);
      setIsModalPostOpen(true);
      };
      const handleConfirmDeletePost = async () => {
        try {
          await PostService.deletePost(selectedPostId);
          setDeleteSuccess(true);
          setIsModalPostOpen(false);
          //render the screen
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
      
    return (
        <div className='container'>
            <h1 className='text-primary'>User List</h1>
            <Link to="/Create" className='button2'> Create +</Link> 
            
            <table ref={tableRef} className='table'>
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
                {/* Check if the user.id matches the authenticated user's ID */}
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
      {showMoreButton && (
        <Button onClick={fetchMoreUsers} className='button2'>
          Show More
        </Button>
      )}
            <Link to={`/status`} className='button2'>Status</Link>
            <Link to={`/Chart`} className='button2'>Chart</Link>
            <DeleteUserModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
      />
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
      {showMoreButton && (
        <Button onClick={fetchMorePosts} className='button2'>
          Show More
        </Button>
      )}
      <Button onClick={logout}>Logout</Button>
      <DeletePostModal
          open={isModalPostOpen}
          onClose={handleCloseModalPost}
          onConfirm={handleConfirmDeletePost}
        />
        </div>
        
    )    
}
    export default Home;

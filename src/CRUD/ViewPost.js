import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import '../css_styling/container.css';
import PostService from '../Service/Service_posts';
import UserService from '../Service/Service';
function ViewPost() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [DataTransfer, setDataTransfer] = useState([]);
    const [userData, setUserData] = useState([]);
    useEffect(() => {
        async function fetchData() {
            const post = await PostService.getPost(id);
            setDataTransfer(post);
               // Fetch user details associated with the post
               const user = await UserService.getUser(post.userid);
               setUserData(user);
            
        }
        fetchData();
    }
        , [id])
    return (
        <div className='container'>
            <h1>Post Details</h1>
            <h2>Caption: {DataTransfer.caption}</h2>
            <h2>Date: {DataTransfer.Date}</h2>
            <h2>User: {userData.name}</h2>
            <h2>Email: {userData.email}</h2>
            <button onClick={() => navigate('/home')}>Back</button>
        </div>
    )
}
export default ViewPost;
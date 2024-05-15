import React,{ useEffect } from "react";
import '../css_styling/form.css'
import '../css_styling/button.css'
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PostService from "../Service/Service_posts";
import UserService from "../Service/Service";
import axios from "axios";
function CreatePost() {
    const [inputData, setInputData] = useState({
        caption: '',
        Date: '',
        userid: ''
    });
    const [userEmails, setUserEmails] = useState([]);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const curPage = searchParams.get('curPage');
    const pageSize = searchParams.get('pageSize');
    useEffect(() => {
        async function fetchUserEmails() {
            try {
                console.log(curPage, pageSize, 'curPage, pageSize');
                const { users, totalPages }= await UserService.getAllUsers(curPage, pageSize);
                console.log(users);
                const emails = users.map(user => user.email);
                setUserEmails(emails);
            } catch (error) {
                console.error('Error fetching user emails:', error);
            }
        }
        fetchUserEmails();
    }, []);
    const handleInputChange = async (e) => {
        const { name, value } = e.target;
        setInputData({
            ...inputData,
            [name]: value
        });
        if (name === 'useremail')
        {
       
            //find the user id corresponding to the selected email
            const { users, totalPages } = await UserService.getAllUsers(curPage, pageSize);
            const selectedUser = users.find(user => user.email === value);
            if (selectedUser) {
                setInputData(prevState => ({ ...prevState, userid: selectedUser.id }));
            }
        }

    };
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3030/posts/create', inputData);
        } catch (error) {
            PostService.createLocalPost(inputData);
        }
        // Navigate to home page
        navigate('/home');
    };
    
    return (
        <div> 
            <form className="form-container" onSubmit={handleSubmit}> 
                <label className="form-label" htmlFor="caption">Caption:</label>
                <input className="form-input" type="text" id="caption" name="caption" onChange={e => setInputData({...inputData,caption:e.target.value})}/>
                <label className="form-label" htmlFor="Date">Date:</label>
                <input className="form-input" type="text" id="Date" name="Date" onChange={e => setInputData({...inputData,Date:e.target.value})}/>
                <label className="form-label" htmlFor="useremail">User Email:</label>
                <select className="form-input" id="useremail" name="useremail" onChange={handleInputChange}>
                    <option value="">Select User Email</option>
                    {userEmails.map((email, index) => (
                        <option key={index} value={email}>{email}</option>
                    ))}
                </select>
                <label className="form-label" htmlFor="userid">User ID:</label>
                <input className="form-input" type="text" id="userid" name="userid" value={inputData.userid} disabled />
                <button className='form-button' type="submit">Submit</button>
            </form>
        </div>
    );
    }
export default CreatePost;
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../css_styling/container.css';
import PostService from '../Service/Service_posts';
function UpdatePost() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [inputData, setInputData] = useState({
        caption: '',
        Date: '',
        userid: ''
    });
    useEffect(() => {
        async function fetchData() {
            // Fetch post data and pre-fill the form
            const post = await PostService.getPost(id);
            setInputData(post);
        }
        fetchData();
    }, [id]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
        await axios.put(`http://localhost:3030/posts/update/${id}`, inputData);}
        catch(error){
            PostService.updateLocalPost(inputData);
        }
        navigate('/home');
    }
    return (
        <div>
            <form className="form-container" onSubmit={handleSubmit}>
                <label className="form-label" htmlFor='caption'>Caption:</label>
                <input
                    className="form-input"
                    type="text"
                    name="caption"
                    id='caption'
                    value={inputData.caption}
                    onChange={e => setInputData({ ...inputData, caption: e.target.value })}
                />
                <label className="form-label" htmlFor='Date'>Date:</label>
                <input
                    className="form-input"
                    type="text"
                    name="Date"
                    id='Date'
                    value={inputData.Date}
                  
                />
                <label className="form-label" htmlFor='userid'>User ID:</label>
                <input
                    className="form-input"
                    type="text"
                    name="userid"
                    id='userid'
                    value={inputData.userid}
                   
                />
                <button className="form-button" type="submit">Update Post</button>
            </form>
        </div>
    )
}
export default UpdatePost;
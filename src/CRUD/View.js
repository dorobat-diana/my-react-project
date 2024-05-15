import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';
import '../css_styling/container.css';
import UserService from '../Service/Service';

function View() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [DataTransfer, setDataTransfer] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const user = await UserService.getUser(id);
            setDataTransfer(user);
        }
        fetchData();
    }
        , [])
    return (
        <div className='container'>
            <h1>User Details</h1>
            <h2>Name: {DataTransfer.name}</h2>
            <h2>Email: {DataTransfer.email}</h2>
            <h2>Age: {DataTransfer.age}</h2>
            <h2>Password: {DataTransfer.password}</h2>
            <button onClick={() => navigate('/home')}>Back</button>
        </div>
    )
}
export default View;   
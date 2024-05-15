import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../css_styling/container.css';
import UserService from '../Service/Service';

function Update() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [inputData, setInputData] = useState({
        name: '',
        email: '',
        password: '',
        age: ''
    });

    useEffect(() => {
        async function fetchData() {
        // Fetch user data and pre-fill the form
        const user = await UserService.getUser(id);
        setInputData(user);

            
    }
        fetchData();}, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
        await axios.put(`http://localhost:3030/update/${id}`, inputData);
        }catch(error){
            UserService.updateLocalUser(inputData);
        }
        navigate('/home');
    }
        

    return (
        <div> 
            <form className="form-container" onSubmit={handleSubmit}> 
                <label className="form-label" htmlFor='name'>Name:</label>
                <input
                    className="form-input"
                    type="text"
                    name="name"
                    id='name'
                    value={inputData.name}
                    onChange={e => setInputData({ ...inputData, name: e.target.value })}
                />
                <label className="form-label" htmlFor='email'>Email:</label>
                <input
                    className="form-input"
                    type="text"
                    name="email"
                    id='email'
                    value={inputData.email}
                    onChange={e => setInputData({ ...inputData, email: e.target.value })}
                />
                <label className="form-label" htmlFor='age'>Age:</label>
                <input
                    className="form-input"
                    type="text"
                    id="age"
                    name="age"
                    value={inputData.age}
                    onChange={e => setInputData({ ...inputData, age: e.target.value })}
                />
                <label className="form-label" htmlFor='password'>Password:</label>
                <input
                    className="form-input"
                    type="text"
                    id="password"
                    name="password"
                    value={inputData.password}
                    onChange={e => setInputData({ ...inputData, password: e.target.value })}
                />
                <button className='form-button' type="submit">Submit</button>
            </form>
        </div>
    );
}

export default Update;

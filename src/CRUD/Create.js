import React from "react";
import '../css_styling/form.css'
import '../css_styling/button.css'
import { useState ,useEffect} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UserService from "../Service/Service";
function Create() {
    const [inputData, setInputData] = useState({
        name: '',
        email: '',
        password: '',
        age: ''
    })
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
     
            try{
            await axios.post('http://localhost:3030/create', inputData);
            } catch (error) {
                UserService.createLocalUser(inputData);
                console.log("create local user has been called")
            }
            navigate('/home');
        
    }
    return (
        <div> 
            <form className="form-container" onSubmit={handleSubmit}> 
                <label className="form-label" htmlFor="name">Name:</label>
                <input className="form-input" type="text" id="name" name="name" onChange={e => setInputData({...inputData,name:e.target.value})}/>
                <label className="form-label" htmlFor="email">Email:</label>
                <input className="form-input" type="text" id="email" name="email" onChange={e => setInputData({...inputData,email:e.target.value})}/>
                <label className="form-label" htmlFor="age">Age:</label>
                <input className="form-input" type="text" id="age" name="age" onChange={e => setInputData({...inputData,age:e.target.value})} />
                <label className="form-label" htmlFor="password">Password:</label>
                <input className="form-input" type="text" id="password" name="password" onChange={e => setInputData({...inputData,password:e.target.value})}/>
                <button className='form-button' type="submit">Submit</button>
            </form>
        </div>
    );
    }
export default Create;
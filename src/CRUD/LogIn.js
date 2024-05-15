import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../Service/Service';
import PostService from '../Service/Service_posts';
import axios from 'axios';


function LogIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inputData, setInputData] = useState({
    name: '',
    email: '',
    password: '',
    age: ''
})
  const [error, setError] = useState(null); // State for error message
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log('verifiying user... '); 
      console.log('email: ', email);
      console.log('password: ', password);
      // Attempt to verify the user
      const token =await UserService.verifyUser(email, password);
      console.log('User verified successfully');
      localStorage.setItem('token', token);
      // If successful, navigate to the home page
      navigate('/home');
    } catch (error) {
      // If verification fails, set the error state
      setError(error.message);
      console.error('Failed to verify user:', error);
    }
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    
    try{
        console.log('creating user... ');
        await UserService.createUser(inputData);
        alert('Registration successful. Please log in.');
        navigate('/');
        } catch (error) {
            console.log("create local user has been called");
           setError(error.message);
        }
        
  };



  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <label>
          Email:
          <input
            type="text"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password:
          <input
            type="text"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit">Login</button>
      </form>
        <h1>Register</h1>
      <form onSubmit={handleRegister}>
      <label className="form-label" htmlFor="name">Name:</label>
        <input className="form-input" type="text" id="name" name="name" onChange={e => setInputData({...inputData,name:e.target.value})}/>
        <label className="form-label" htmlFor="email">Email:</label>
        <input className="form-input" type="text" id="email" name="email" onChange={e => setInputData({...inputData,email:e.target.value})}/>
        <label className="form-label" htmlFor="age">Age:</label>
        <input className="form-input" type="text" id="age" name="age" onChange={e => setInputData({...inputData,age:e.target.value})} />
        <label className="form-label" htmlFor="password">Password:</label>
        <input className="form-input" type="text" id="password" name="password" onChange={e => setInputData({...inputData,password:e.target.value})}/>
        <button type="submit">Register</button>
      </form>
      {error && <p style={{ color: 'red' }}>"Failed to log in"</p>} Display error message
    </div>
  );
}

export default LogIn;

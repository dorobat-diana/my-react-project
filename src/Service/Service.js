import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
const API_URL = 'http://localhost:3030';
let socket
let users = [];
let locallyModifiedUsers = [];
const USER_STORAGE_KEY = 'users';
const UserService = {
  connect: async () => {
    try {
      socket = new WebSocket('ws://localhost:3030');

      socket.addEventListener('open', function () {
        console.log('Connection established.');
      });
      socket.addEventListener('close', function () {
        console.log('Connection closed. Attempting to reconnect...');
        // Attempt to reconnect after a delay
        setTimeout(UserService.connect, 3000); // Retry connection after 3 seconds
      });
      socket.addEventListener('error', function (error) {
        console.error('Socket error:', error);
      });
    } catch (error) {
      console.error('Failed to establish connection:', error);
    }
  },
  verifyConnection: async () => {
    try {
      const response = await axios.get(`${API_URL}`);
      if (response.status === 200) {
        UserService.syncWithDatabase();
      } else {
        console.error('Failed to verify connection:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to verify connection:', error);
    }
  },

  syncWithDatabase: async () => {
    // Get locally stored changes
    let locallyModifiedUsers = JSON.parse(localStorage.getItem(USER_STORAGE_KEY)) || [];
    
    // Remove users missing required properties (name, email, or age)
    locallyModifiedUsers = locallyModifiedUsers.filter(user => {
      return user.name && user.email && user.age && user.password;
    });
  
    // Send locally modified data to the server
    // Do it only if there are elements in the array
    if (locallyModifiedUsers.length > 0){
      try{
        await axios.post(`${API_URL}/sync`, locallyModifiedUsers);
        // Once synchronization is successful, update local storage
        localStorage.removeItem(USER_STORAGE_KEY);
      } catch (error) {
        console.error('Failed to sync with database:', error);
      }
    }
  }
  ,

  getAllUsers: async (curPage, pageSize) => {
    try {
      const response = await axios.get(`${API_URL}?curPage=${curPage}&pageSize=${pageSize}`);
      users = response.data.users;
      return { users, totalPages: response.data.totalPages };
    } catch (error) {
          // Merge data from users and locallyModifiedUsers
    const newUserslist = users.map((user) => {
      // Check if the user exists in locallyModifiedUsers
      const modifiedUser = locallyModifiedUsers.find((locallyModifiedUser) => locallyModifiedUser.id === user.id);
      if (modifiedUser && Object.keys(modifiedUser).length > 1) {
        // If modifiedUser exists and contains data other than just ID, use it
        return modifiedUser;
      }else if (!modifiedUser) {
        // If modifiedUser does not exist, use the user data
        return user;
      }
      });
      //sort users by age
      newUserslist.sort((a, b) => a.age - b.age);
      return { users: newUserslist, totalPages: 1 };
    }
  },
  getUser: async (id) => {
    try{
      const response = await axios.get(`${API_URL}/view/${id}`);
      return response.data;
    }
    catch(error){
      //look inside locally modified and then in the users list
      const user = locallyModifiedUsers.find(user => user.id === id) || users.find(user => user.id === id); 
      if (user) {
        return user;
      } else {
        // If user data is not available locally, throw an error
        throw new Error('User not found');
      }
    }
    
  },

  createUser: async (userData) => {
    try{
    console.log('creating user2... ');
    const response = await axios.post(`${API_URL}/create`, userData);
    console.log('response:', response); 
    if (response.status === 400) {
      throw new Error('User not found');
    }
    } catch (error) {
      throw error;
    }
  },
  createLocalUser: (userData) => {
     // Validate the required fields (name, email, age)
     if (!userData.name || !userData.email || !userData.age || !userData.password) {
      console.error('Incomplete user data:', userData);
      return; // Exit the function if any required field is missing
  }
    //add a random id to the user data using uuid
    userData.id = uuidv4();
    users.push(userData);
    //add only the new user to the local storage
    console.log('problem from create local');
    locallyModifiedUsers.push(userData);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(locallyModifiedUsers));
  },

  updateUser: async (id, userData) => {
    try{
      const response = await axios.put(`${API_URL}/update/${id}`, userData);
    }catch (error) {

      console.error(error);
    }
    
    return null;
  },
  updateLocalUser: (userData) => {
    //update the user in the locally modified users list , if it is not there get it from the users list and add it to the locally modified users list
    const index = locallyModifiedUsers.findIndex((user) => user.id === userData.id);
    if (index !== -1) {
      locallyModifiedUsers[index] = userData;
    } else {
      const user = users.find((user) => user.id === userData.id);
      if (user) {
        console.log('problem from update local');
        locallyModifiedUsers.push(userData);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(locallyModifiedUsers));
      }
    }
  },

  deleteUser: async (id) => {
    try{
    const response = await axios.delete(`${API_URL}/delete/${id}`);
    }
    catch (error) {

      users = users.filter((user) => user.id !== id);
      const deletedUser = { id }; // Create an object with the deleted user's ID
      console.log('problem from delete');
    locallyModifiedUsers.push(deletedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(locallyModifiedUsers));
    }
    return null;
  },
  getAllUsersForChart: async () => {
    try{
      const response = await axios.get(`${API_URL}/chart`);
      return response.data;
    }catch (error) {
      console.error('Failed to fetch chart data:', error);
      return [];
    }
  },
  verifyUser: async (email, password) => {
    try{
      console.log('verifiying user... ');
      const response = await axios.get(`${API_URL}/verify/${email}/${password}`);
      console.log('response:', response);
      if (response.status === 400 || response.data==='404. Page not found!') {
        throw new Error('User not found');
      }
          // User authenticated, generate JWT token

    // Send token to client
      return response.data.token;
    }catch (error) {

      console.error('Failed to verify user:', error);
      throw error;
    }
  },
  getAuthenticatedUserId: async (token) => {
    try{
      const response = await axios.get(`${API_URL}/auth`, {
        headers: {
          Authorization: token,
        },
      });
      return response.data.id;
    }catch (error) {
      console.error('Failed to authenticate user:', error);
      throw error;
    }
  },
};

export default UserService;
export { socket };

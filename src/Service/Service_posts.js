import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const API_URL = 'http://localhost:3030/posts';
let socket_post
let posts = [];
let locallyModifiedPosts = [];
const POST_STORAGE_KEY = 'posts';
const PostService = {  
    connect: async () => {
        try {
            socket_post = new WebSocket('ws://localhost:3030/posts');
            socket_post.addEventListener('open', function () {
                console.log('Connection established.');
            });
            socket_post.addEventListener('close', function () {
                console.log('Connection closed. Attempting to reconnect...');
                // Attempt to reconnect after a delay
                setTimeout(PostService.connect, 3000); // Retry connection after 3 seconds
            });
            socket_post.addEventListener('error', function (error) {
                console.error('Socket error:', error);
            });
        } catch (error) {
            console.error('Failed to establish connection:', error);
        }
    }, 
    verifyPostconnection: async () => {
        try{
        const response = await axios.get(`${API_URL}`);
        if (response.status === 200){
            PostService.syncWithDatabase();
        }
        else{
            console.error('Error verifying connection:', response.statusText);
        }
    }
        catch (error) {
            console.error(error);
        }
        
    },
    syncWithDatabase: async () => {
        // Get locally stored changes
        const locallyModifiedPosts = JSON.parse(localStorage.getItem(POST_STORAGE_KEY)) || [];
        // Send locally modified data to the server
        //do it only if there are elements in the array
        if (locallyModifiedPosts.length > 0){
            try{
                await axios.post(`${API_URL}/sync`, locallyModifiedPosts);
                // Once synchronization is successful, update local storage
                localStorage.removeItem(POST_STORAGE_KEY);
            } catch (error) {
                console.error('Failed to sync with database:', error);
            }
        }
    },
    getAllPosts: async (curPostPage,postPageSize) => {
        try{
            const response = await axios.get(`${API_URL}?curPostPage=${curPostPage}&postPageSize=${postPageSize}`);
            posts = response.data;
            return posts;
        }
        catch(error){
            const newPostslist = posts.map((post) => {
                const locallyModifiedPost = locallyModifiedPosts.find((locallyModifiedPost) => locallyModifiedPost.id === post.id);
                if (locallyModifiedPost && Object.keys(locallyModifiedPost).length > 1) {
                    return locallyModifiedPost;
                } else if (!locallyModifiedPost) {
                    return post;
                }
            });
            return newPostslist;
        }
     },

    getPost: async (id) => {
        try{
            const response = await axios.get(`${API_URL}/view/${id}`);
            return response.data;
        }
        catch(error){
            // If server is offline, return locally stored post data if available
            const post = locallyModifiedPosts.find((post) => post.id === id) || posts.find((post) => post.id === id);
            if (post) {
                return post;
            } else {
                // If post data is not available locally, throw an error
                throw new Error('Post not found');
            }
        }
    },
    createPost: async (postData) => {
        try{
        const response = await axios.post(`${API_URL}/create`, postData);
        }
        catch (error) {
            console.error(error);
        }
        return null;
    },
    createLocalPost: (postData) => {
        //add a random id to the post data using uuid
        postData.id = uuidv4();
        posts.push(postData);
        locallyModifiedPosts.push(postData);
        localStorage.setItem(POST_STORAGE_KEY, JSON.stringify(locallyModifiedPosts));
    },
    updatePost: async (id, postData) => {
        try{
        const response = await axios.put(`${API_URL}/update/${id}`, postData);}
        catch (error) {
            console.error(error);
        }
        return null;
    },
    updateLocalPost: (postData) => {
        const index = locallyModifiedPosts.findIndex((post) => post.id === postData.id);
        if (index !== -1) {
            locallyModifiedPosts[index] = postData;
        } else {
            const post = posts.find((post) => post.id === postData.id);
            if (post) {
                locallyModifiedPosts.push(postData);
                localStorage.setItem(POST_STORAGE_KEY, JSON.stringify(locallyModifiedPosts));
            }
        }
    },
    deletePost: async (id) => {
        try{
        const response = await axios.delete(`${API_URL}/delete/${id}`);
    }catch (error) {
        posts = posts.filter((post) => post.id !== id);
        const deletedPost = {id};
        locallyModifiedPosts.push(deletedPost);
        localStorage.setItem(POST_STORAGE_KEY, JSON.stringify(locallyModifiedPosts));
    }
        return null;
    },
    getUserPosts: async (curPostPage,postPageSize) => {
        try{
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/user?curPostPage=${curPostPage}&postPageSize=${postPageSize}`, {
                headers: { Authorization: token }
              });
            posts = response.data;
            return posts;
        }
        catch(error){
            const newPostslist = posts.map((post) => {
                const locallyModifiedPost = locallyModifiedPosts.find((locallyModifiedPost) => locallyModifiedPost.id === post.id);
                if (locallyModifiedPost && Object.keys(locallyModifiedPost).length > 1) {
                    return locallyModifiedPost;
                } else if (!locallyModifiedPost) {
                    return post;
                }
            });
            return newPostslist;
        }
     },
};
export default PostService;
export { socket_post };
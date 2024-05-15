import React from 'react';
import Home from './CRUD/Home';
import Create from './CRUD/Create';
import View from './CRUD/View';
import Charts from './CRUD/Chart';
import { BrowserRouter, Routes, Route  }from 'react-router-dom'; // Import BrowserRouter, Routes, and Route
import { useParams } from 'react-router-dom';
import Update from './CRUD/Update';
import Status from './CRUD/Status';
import ViewPost from './CRUD/ViewPost';
import UpdatePost from './CRUD/UpdatePost';
import CreatePost from './CRUD/CreatePost';
import LogIn from './CRUD/LogIn';


function App() {
 
  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogIn />} initial ></Route>
        <Route path="/home" element={<Home />}></Route>
        <Route path="/Create" element={<Create />}></Route>
        <Route path="/View/:id" element={<View />}></Route>
        <Route path="/Update/:id" element={<Update />}></Route>
        <Route path="/Chart" element={<Charts />}></Route>
        <Route path="/status" element={<Status />}></Route>
        <Route path="/posts/view/:id" element={<ViewPost />}></Route>
        <Route path="/posts/update/:id" element={<UpdatePost />}></Route>
        <Route path="/posts/create" element={<CreatePost />}></Route> 
        

      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
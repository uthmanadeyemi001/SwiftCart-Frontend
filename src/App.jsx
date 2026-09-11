import { useState } from 'react'
// import heroImg from './assets/hero.png'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import './App.css'
import {Routes, Route} from "react-router-dom";
import { Analytics } from '@vercel/analytics/react';
import Signup from './Pages/Signup';
import Login from './Pages/Login';
import LandingPage from './Pages/LandingPage';
import Admin from './Pages/Admin';
import Home from './Pages/Home';
import Cart from './Pages/Cart';
import Search from './Pages/Search';
import OrderSuccess from './Pages/OrderSuccess';
import AdminOrders from './Pages/AdminOrders';
import Profile from './Pages/Profile';

function App() {


  return (
    <>
      
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/search" element={<Search />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/profile" element={<Profile />} />

        </Routes>
        <Analytics />
    </>
  )
}

export default App

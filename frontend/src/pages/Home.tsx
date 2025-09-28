import React from 'react'
import Header from '../components/Header'
import { useAuth } from "../context/AuthContext"; 

const Home = () => {
   const { user } = useAuth();
  return (
    <>
      <Header />
      <h1>{user?.email}</h1>
      <h1>{user?.id}</h1>
    </>
  )
}

export default Home
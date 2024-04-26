// Importing React and necessary components for routing
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Homepage from '../Pages/Homepage'
import ChatPage from '../Pages/ChatPage'

// Component to define all routes using React Router's Routes and Route
const AllRoutes = () => {
    return (
        < Routes >
            {/* route redirect to a page */}
            <Route path="/" element={< Homepage />} />
            <Route path="/chat" element={<ChatPage />} />
        </Routes >
    )
}
// Exporting the AllRoutes component
export default AllRoutes;
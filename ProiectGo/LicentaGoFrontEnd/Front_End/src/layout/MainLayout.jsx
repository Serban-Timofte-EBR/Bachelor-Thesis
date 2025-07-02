import React from "react";
import Navbar from '../components/General/navbar';

const MainLayout = ({children}) => {
    return (
        <>
            <Navbar />
            {children}
        </>
    );
}

export default MainLayout;
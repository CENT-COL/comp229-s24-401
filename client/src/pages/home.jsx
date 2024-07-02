import React, { useEffect, useState } from 'react';

const Home = () => {
    const [data, setData] = useState(null);
    const apiUrl = import.meta.env.VITE_API_URL || '/api';

    useEffect(() => {
        fetch(`${apiUrl}/data`)
        .then(response => response.json())
        .then(data => setData(data))
    }, [apiUrl])

    return (
        <div>
            <h1>Home Page</h1>
            <p>Welcome to the Home Page</p>
            {data && <p>Data from server: {data.message}</p>}
        </div>
    )
}

export default Home;
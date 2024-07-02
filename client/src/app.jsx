import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';



import Home from './pages/home';
import Services from './pages/services';
import About from './pages/about';
import Projects from './pages/projects';
import Contact from './pages/contact';
import Register from './pages/register';

function App() {
    const { user, setUser } = useState(null);

    return (
        <Router>
            <div className="App">
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <Link className="navbar-brand" to="/">
                        My portfolio
                    </Link>
                    <div className="collapse navbar-collapse">
                        <ul className="navbar-nav mr-auto">
                            <li className="nav-item">
                                <Link className="nav-link" to='/'>Home</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to='/services'>Services</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to='/projects'>Projects</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to='/about'>About</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to='/contact'>Contact</Link>
                            </li>
                        </ul>
                        <ul className="navbar-nav ml-auto">
                            {user ? (<>
                                
                            </>) 
                            
                            : 
                            
                            
                            (<>
                                 <li className="nav-item">
                                    <Link className="nav-link" to='/register'>Register</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to='/login'>Login</Link>
                                </li>
                            
                             </>)}
                        </ul>
                    </div>
                </nav>
                <div className="container mt-4 text-center">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/register" element={<Register />} />
                    </Routes>
                </div>
                <nav className="navbar fixed-bottom navbar-light bg-light">
                    <span className="navbar-text">
                        &copy; 2024 My Portfolio
                    </span>
                </nav>
            </div>
        </Router>
    );
}

export default App;
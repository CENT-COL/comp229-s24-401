import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ setUser }) => {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  // add 2FA states
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);

  const [error, setError] = useState('');
  const navigate = useNavigate();
  const apiUrl = '/api';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });
      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      console.log("Response Data Before 2FA", data);

      // Check if the user has 2FA enabled
      if(data.is2FAEnabled){
        //Proceed to OTP step
        setStep(2);
      } else{
        // Complete the login process as usual
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        setUser({ username: data.username, token: data.token });
        navigate('/');
      }

    } catch (error) {
      setError(error.message);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/users/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: form.email, token: otp })
      });

      if (!response.ok) {
        throw new Error('Invalid OTP');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      setUser({ username: data.username, token: data.token });
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div className="container mt-4">
      <h1 className="text-center">Login</h1>
      {error && <p className="text-danger">{error}</p>}
      {step === 1 && (
         <form onSubmit={handleSubmit}>
         <div className="form-group">
           <label htmlFor="email">Email</label>
           <input
             type="email"
             className="form-control"
             id="email"
             name="email"
             value={form.email}
             onChange={handleChange}
             required
           />
         </div>
         <div className="form-group">
           <label htmlFor="password">Password</label>
           <input
             type="password"
             className="form-control"
             id="password"
             name="password"
             value={form.password}
             onChange={handleChange}
             required
           />
         </div>
         <button type="submit" className="btn btn-primary">Login</button>
       </form>
      )}
      {step === 2 && (
        <form onSubmit={handleOtpSubmit}>
          <div className="form-group">
            <label htmlFor="otp">OTP</label>
            <input
              type="text"
              className="form-control"
              id="otp"
              name="otp"
              value={otp}
              onChange={handleOtpChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Submit OTP</button>
        </form>
      )}
     
    </div>
  );
};

export default Login;
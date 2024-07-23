import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
    });

    //states for 2FA
    const [qrCode, setQrCode] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);    

    const [error, setError] = useState('');
    const navigate = useNavigate();
    const apiUrl = '/api';

    const handleChange = (e) => {
        const { name, value} = e.target;
        setForm({...form, [name]: value});
    }

    const setup2FA = async(email) => {

        console.log("API Url", apiUrl);
        console.log("Full API call to setup-2FA", `${apiUrl}/users/setup-2fa`)
        console.log("Email", email)

        const response = await fetch(`${apiUrl}/users/setup-2fa`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: form.email })
        });

        if(response.ok){
            const data = await response.json();
            console.log("Server Response", data);
            setQrCode(data.imageUrl);
        } else {
            console.log("Response", response);
            setError('Failed to generate the QR Code')
        }
    }

    const verify2FASetup = async () => {
        const response = await fetch(`${apiUrl}/users/verify-2fa-setup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: form.email, token: otp })
        });

        if(response.ok){
            setError('2FA setup is complete. You can now log in')
            navigate('/login');
        } else {
            setError('Failed to verify the token');
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log("API Url", apiUrl);
            const response = await fetch(`${apiUrl}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });

            if(!response.ok) {
                throw new Error('Registration failed');
            }

            const data = await response.json();
            //Proceed to 2FA Setup
            await setup2FA(data.email);
            setStep(2);
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <div className="contaier mt-4">
            <h1 className="text-center">Register</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            {step === 1 && (            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input type="text" 
                        className="form-control" 
                        id="username" 
                        name="username" 
                        value={form.username}
                        onChange={handleChange}
                        required
                        />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="text" 
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
                    <input type="password" 
                        className="form-control" 
                        id="password" 
                        name="password" 
                        value={form.password}
                        onChange={handleChange}
                        required
                        />
                </div>
                <button type="submit" className="btn btn-primary">Register</button>
            </form>)}
            {step=== 2 && (
                <div>
                    {qrCode && <img src={qrCode} alt="QR Code" />}
                    <div className="form-group">
                        <label htmlFor="otp">OTP</label>
                        <input type="text"
                         className="form-control"
                         id="otp"
                         name="otp"
                         value={otp}
                         onChange={(e) => setOtp(e.target.value)}
                         required
                        />
                    </div>
                    <button onClick={verify2FASetup} className="btn btn-primary">Verify OTP</button>
                </div>
            )}
        </div>
    )

}

export default Register;
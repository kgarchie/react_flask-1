import React, {useState} from 'react';
import {Modal} from 'bootstrap';
import '../assets/css/form.css'
import {useNavigate} from "react-router-dom";
import $fetch from "../utils/fetch";
import {setAuthCookie} from "../utils/auth.ts";

const SignUp: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [_2faMode, set2faMode] = useState('');
    const [code, setCode] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting:', {username: email, password});

        $fetch('/api/signin', {
            method: 'POST',
            body: {
                email: email,
                password: password,
            },
            onResponseError({response}): Promise<void> | void {
                if (response.status === 401) {
                    alert('Invalid email or password');
                }
            }
        }).then(res => {
            if (res.error) {
                alert(res.error);
            } else {
                const modal = new Modal(document.getElementById('2faModal')!);
                modal.show();
            }
        }).catch(err => {
            console.error(err);
        })
    };

    const show2faCodeModal = () => {
        const prevModal = Modal.getInstance(document.getElementById('2faModal')!);
        prevModal?.hide();

        $fetch<{ message?: string, error?: string }>(`/api/2fa/${_2faMode.toLowerCase().trim()}`, {
            method: 'POST',
            body: {
                email: email,
            }
        }).then(res => {
            if (res.error) {
                alert(res.error);
            } else {
                alert(res.message);
            }
        }).catch(err => {
            console.error(err);
        })

        const modal = new Modal(document.getElementById('2faCodeModal')!);
        modal.show();
    }

    const handleCheck2FA = () => {
        $fetch<{ token?: string, error?: string }>(`/api/2fa/verify`, {
            method: 'POST',
            body: {
                email: email,
                code: code,
            },
            onResponseError({response}): Promise<void> | void {
                if (response.status === 401) {
                    alert('Invalid 2FA code');
                }
            }
        }).then(res => {
            if (res.error) {
                alert(res.error);
            } else {
                setAuthCookie(res.token!);
                const modal = Modal.getInstance(document.getElementById('2faCodeModal')!);
                modal?.hide();
                navigate('/profile');
            }
        }).catch(err => {
            console.error(err);
        })
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className='container'>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email address</label>
                        <input type="email" className="form-control" id="email" aria-describedby="emailHelp"
                               onChange={e => setEmail(e.target.value)}/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password_1" className="form-label">Password</label>
                        <input type="password" className="form-control" id="password_1"
                               onChange={e => setPassword(e.target.value)}/>
                    </div>
                    <button type="submit" className="btn btn-primary">Submit</button>
                </div>
            </form>
            <div className="modal fade" id="2faModal" data-bs-backdrop="static" data-bs-keyboard="false"
                 tabIndex={-1}
                 aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="staticBackdropLabel">2FA Authentication</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <h5 className="mb-3 font-weight-bold">Choose your 2FA method</h5>
                            <div className="form-check d-flex gap-5">
                                <div>
                                    <input className="form-check-input" type="radio" name="flexRadioDefault"
                                           id="flexRadioDefault1" onClick={() => set2faMode(() => 'Email')}/>
                                    <label className="form-check-label" htmlFor="flexRadioDefault1">
                                        Email
                                    </label>
                                </div>
                                <div>
                                    <input className="form-check-input" type="radio" name="flexRadioDefault"
                                           id="flexRadioDefault2" onClick={() => set2faMode(() => 'Phone')}/>
                                    <label className="form-check-label" htmlFor="flexRadioDefault2">
                                        Phone
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" onClick={() => show2faCodeModal()}>Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="2faCodeModal" data-bs-backdrop="static" data-bs-keyboard="false"
                 tabIndex={-1}
                 aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="staticBackdropLabel">{_2faMode}</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <h5 className="mb-3 font-weight-bold">A code has been sent to your {_2faMode}</h5>
                            <div className="mb-3">
                                <label htmlFor="code" className="form-label">6 Digit Code</label>
                                <input type="text" className="form-control" id="code"
                                       onChange={e => setCode(e.target.value)}/>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" onClick={() => handleCheck2FA()}>Check
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SignUp;

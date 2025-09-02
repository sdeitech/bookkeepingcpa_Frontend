import React from 'react'
import logo from "../../Assets/images/plutus-logo.svg";

function BusinessTrack() {
    return (
        <div>
            <div className="main_wrapper">
                <div className="outer-container">
                    <div className="left-panel">
                        <img
                            src={logo}
                            alt=""
                        />
                    </div>

                    <div className="right-panel">
                        <div className="progress">
                            <div className="progress-bar"></div>
                        </div>

                        <div className="ques-outer-wrapper">
                            <div className="heading_stepper">
                                <div className="question">Tell us about your business</div>
                                <div className="subtext">This helps us customize your experience.</div>
                            </div>

                            <div className="question_sec form_section">
                                <div className="form-group">
                                    <label>Business Name</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Enter your business name"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Business Type</label>
                                    <select className="form-control">
                                        <option value="">Select business type</option>
                                        <option value="sole_proprietorship">Sole Proprietorship</option>
                                        <option value="llc">LLC</option>
                                        <option value="corporation">Corporation</option>
                                        <option value="partnership">Partnership</option>
                                        <option value="s_corp">S Corporation</option>
                                        <option value="nonprofit">Non-Profit</option>
                                    </select>
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Year Started</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="YYYY"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Number of Employees</label>
                                        <select className="form-control">
                                            <option value="">Select range</option>
                                            <option value="1">Just me</option>
                                            <option value="2-5">2-5 employees</option>
                                            <option value="6-10">6-10 employees</option>
                                            <option value="11-25">11-25 employees</option>
                                            <option value="26-50">26-50 employees</option>
                                            <option value="50+">More than 50</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label>Monthly Revenue Range</label>
                                    <select className="form-control">
                                        <option value="">Select revenue range</option>
                                        <option value="0-10k">Less than $10,000</option>
                                        <option value="10k-50k">$10,000 - $50,000</option>
                                        <option value="50k-100k">$50,000 - $100,000</option>
                                        <option value="100k-500k">$100,000 - $500,000</option>
                                        <option value="500k-1m">$500,000 - $1M</option>
                                        <option value="1m+">More than $1M</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="buttons">
                            <button className="btn-back">Back</button>
                            <button className="btn btn-next">Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BusinessTrack
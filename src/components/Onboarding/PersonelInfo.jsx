import { useState, useEffect } from 'react';
// import "../../Assets/Styles/Onboarding/PersonelInfo.css"
import logo from "../../Assets/images/plutus-logo.svg";

const PersonelInfo = () => {
    return (
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
                            <div className="question">What kind of help does your business need?</div>
                            <div className="subtext">So we can focus on the areas that matter most to you.</div>
                        </div>

                        <div className="question_sec">
                            <div className="option">Nothing yet, just browsing</div>
                            <div className="option">Bookkeeping with Plutify expert support.</div>
                            <div className="option">Clear understanding of where my business stands, maximizing my tax savings, and
                                advisory
                                from a
                                licensed professional.
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
    )
}

export default PersonelInfo

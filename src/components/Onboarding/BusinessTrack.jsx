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
                        {/* <div className="info-card">Average time saved: <strong>10+ hrs monthly per client</strong></div>
                          <div className="info-card">Verified Clients: <strong>60% making better business</strong></div>
                          <h3>Easy and Quick Setup</h3>
                          <p>Set up your accounts without a problem. Easy and fast!</p> */}
                    </div>

                    <div className="right-panel">
                        <div className="progress">
                            <div className="progress-bar"></div>
                        </div>

                        <div className="ques-outer-wrapper">
                            <div className="heading_stepper">
                                <div className="question">How were you keeping track of your business’ performance?​​</div>
                                <div className="subtext">We’ll learn how you’ve been monitoring results so far.​</div>
                            </div>

                            <div className="question_sec">
                                {/* <div class="form-check option" >
                                    <input class="form-check-input" type="radio" name="radioDefault" id="radioDefault1" />
                                    <label class="form-check-label" for="radioDefault1">
                                        Yes
                                    </label>
                                </div>
                                <div class="form-check  option">
                                    <input class="form-check-input" type="radio" name="radioDefault" id="radioDefault2" checked />
                                    <label class="form-check-label" for="radioDefault2">
                                       No
                                    </label>
                                </div> */}
                                <div class="txt-box">
                                    <textarea class="form-control text-wrapper" id="exampleFormControlTextarea1" rows="3" placeholder="Write Something Here"></textarea>
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

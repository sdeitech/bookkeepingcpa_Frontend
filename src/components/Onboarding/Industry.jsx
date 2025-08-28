import React from 'react'
import logo from "../../Assets/images/plutus-logo.svg";
import professional from "../../Assets/images/professional.svg";
import socialicon from "../../Assets/images/social-icons.svg";
import realstate from "../../Assets/images/real-estate.svg";
import Agency from "../../Assets/images/agency.svg";
import saas from "../../Assets/images/saas.svg";
import pllimg from "../../Assets/images/pl-img.svg";
import retails from "../../Assets/images/retails.svg";
import ventures from "../../Assets/images/ventures.svg";
import others from "../../Assets/images/other.svg";







function Industry() {
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
                                <div className="question">Select Your Industry</div>
                                <div className="subtext">So we can tailor your setup to your field.​</div>
                            </div>

                            <div className="question_sec industry_sec">
                                <div className="industry_option option">
                                    <img
                                        src={professional}
                                        alt=""
                                    />
                                    Ecommerce
                                </div>
                                <div className="industry_option option">
                                    <img
                                        src={professional}
                                        alt=""
                                    />
                                    Professional Services
                                </div>
                                <div className="industry_option option">
                                    <img
                                        src={socialicon}
                                        alt=""
                                    />
                                    Social Media
                                </div>
                                <div className="industry_option option">
                                    <img
                                        src={realstate}
                                        alt=""
                                    />
                                    Real Estate
                                </div>
                                <div className="industry_option option">
                                    <img
                                        src={Agency}
                                        alt=""
                                    />
                                    Agency
                                </div>
                                <div className="industry_option option">
                                    <img
                                        src={saas}
                                        alt=""
                                    />
                                    Saas
                                </div>
                                <div className="industry_option option">
                                    <img
                                        src={pllimg}
                                        alt=""
                                    />
                                    3PL
                                </div>
                                <div className="industry_option option">
                                    <img
                                        src={retails}
                                        alt=""
                                    />
                                    Retail
                                </div>
                                <div className="industry_option option">
                                    <img
                                        src={ventures}
                                        alt=""
                                    />
                                    AI Ventures
                                </div>
                                <div className="industry_option option">
                                    <img
                                        src={others}
                                        alt=""
                                    />
                                    Others
                                </div>


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

export default Industry

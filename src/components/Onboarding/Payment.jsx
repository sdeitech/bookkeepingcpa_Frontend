
import { useState, useEffect } from 'react';
import "../../Assets/Styles/Onboarding/Payment.css"
import logo from "../../Assets/images/plutus-logo.svg";
import payment from "../../Assets/images/clip-path.svg";
import arrow from "../../Assets/images/right_arrow.svg";



const Payment = () => {
    return (
        <div className="main_wrapper">
            <div className="payment_container">
                <div className="logo-sec">
                    <img
                        src={logo}
                        alt=""
                    />
                </div>
                <div className="payment-sec text-center">
                    <div className="payment-heading">
                        <h4>Choose the <span>Best Plan</span>  for you</h4>
                        <p>Stress-free, CPA-backend bookkeeping - built for modern founders.</p>
                    </div>
                    <div className="payment_cards_wrapper">
                        <div className="payment_cards_sec">
                            <div class="card">
                                <div className="upper_wrapper">
                                    <div className="upper_sec">
                                        <img
                                            src={payment}
                                            alt=""
                                        />
                                        <div className="heading_card">
                                            <h3>Startup</h3>
                                            <p class="desc">Best for solo founders or business under $750k in annual revenue</p>
                                        </div>

                                        <div className=" pricing_wrapper"><h3 className="Pricing_input">$199</h3>
                                            <div>
                                                <p>per month</p>
                                                <span>billed annually</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button class="btn">Get Started Today</button>
                                </div>
                                <h4 class="includes">Startup Plan Includes</h4>
                                <ul>
                                    <a href="#">
                                        <img
                                            src={arrow}
                                            alt=""
                                        /><li>Monthly Profit & Loss</li></a>
                                    <a href="#">
                                        <img
                                            src={arrow}
                                            alt=""
                                        /><li>Balance Sheet</li></a>
                                    <a href="#">
                                        <img
                                            src={arrow}
                                            alt=""
                                        />
                                        <li>Cash Flow Statement</li></a>
                                    <a href="#">
                                        <img
                                            src={arrow}
                                            alt=""
                                        />
                                        <li>Cash Flow Statement</li></a>
                                    <a href="#">
                                        <img
                                            src={arrow}
                                            alt=""
                                        />
                                        <li>Cash Flow Statement</li></a>

                                </ul>
                            </div>
                            <div class="card popular">
                                <div class="badge">Most Popular</div>
                                <div className="upper_wrapper">
                                    <div className="upper_sec">
                                        <img
                                            src={payment}
                                            alt=""
                                        />
                                        <div className="heading_card">
                                            <h3>Essentials</h3>
                                            <p class="desc">For growing teams or businesses making upto $3M a year .  </p>
                                        </div>

                                        <div className=" pricing_wrapper"><h3 className="Pricing_input">$399</h3>
                                            <div>
                                                <p>per month</p>
                                                <span>billed annually</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button class="btn">Get Started Today</button>
                                </div>
                                <h4 class="includes">Startup Plan Includes</h4>
                                <ul>
                                    <a href="#">
                                        <img
                                            src={arrow}
                                            alt=""
                                        /><li>Monthly Profit & Loss</li></a>
                                    <a href="#">
                                        <img
                                            src={arrow}
                                            alt=""
                                        /><li>Balance Sheet</li></a>
                                    <a href="#">
                                        <img
                                            src={arrow}
                                            alt=""
                                        />
                                        <li>Cash Flow Statement</li></a>
                                    <a href="#">
                                        <img
                                            src={arrow}
                                            alt=""
                                        />
                                        <li>Cash Flow Statement</li></a>
                                    <a href="#">
                                        <img
                                            src={arrow}
                                            alt=""
                                        />
                                        <li>Cash Flow Statement</li></a>

                                </ul>
                            </div>
                            <div class="card">
                                <div className="upper_wrapper">
                                    <div className="upper_sec">
                                        <img
                                            src={payment}
                                            alt=""
                                        />
                                        <div className="heading_card">
                                            <h3>Enterprise</h3>
                                            <p class="desc">Best for solo founders or business under $750k in annual revenue</p>
                                        </div>

                                        <div className=" pricing_wrapper"><h3 className="Pricing_input">Contact Us</h3>
                                        </div>
                                    </div>
                                    <button class="btn">Schedule a Call</button>
                                </div>
                                <h4 class="includes">Startup Plan Includes</h4>
                                <ul>
                                    <a href="#">
                                        <img
                                            src={arrow}
                                            alt=""
                                        /><li>Monthly Profit & Loss</li></a>
                                    <a href="#">
                                        <img
                                            src={arrow}
                                            alt=""
                                        /><li>Balance Sheet</li></a>
                                    <a href="#">
                                        <img
                                            src={arrow}
                                            alt=""
                                        />
                                        <li>Cash Flow Statement</li></a>
                                    <a href="#">
                                        <img
                                            src={arrow}
                                            alt=""
                                        />
                                        <li>Cash Flow Statement</li></a>
                                    <a href="#">
                                        <img
                                            src={arrow}
                                            alt=""
                                        />
                                        <li>Cash Flow Statement</li></a>

                                </ul>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Payment

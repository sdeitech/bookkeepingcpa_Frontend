
// import { useState, useEffect } from 'react';
// import "../../Assets/Styles/Onboarding/Payment.css"
// import logo from "../../Assets/images/plutus-logo.svg";
// import payment from "../../Assets/images/clip-path.svg";
// import arrow from "../../Assets/images/right_arrow.svg";





// const Payment = () => {
//     return (
//         <div className="main_wrapper">
//             <div className="payment_container">
//                 <div className="logo-sec">
//                     <img
//                         src={logo}
//                         alt=""
//                     />
//                 </div>
//                 <div className="payment-sec text-center">
//                     <div className="payment-heading">
//                         <h4>Choose the <span>Best Plan</span>  for you</h4>
//                         <p>Stress-free, CPA-backend bookkeeping - built for modern founders.</p>
//                     </div>
//                     <div className="payment_cards_wrapper">
//                         <div className="payment_cards_sec">
//                             <div class="card">
//                                 <div className="upper_wrapper">
//                                     <div className="upper_sec">
//                                         <img
//                                             src={payment}
//                                             alt=""
//                                         />
//                                         <div className="heading_card">
//                                             <h3>Startup</h3>
//                                             <p class="desc">Best for solo founders or business under $750k in annual revenue</p>
//                                         </div>

//                                         <div className=" pricing_wrapper"><h3 className="Pricing_input">$199</h3>
//                                             <div>
//                                                 <p>per month</p>
//                                                 <span>billed annually</span>
//                                             </div>
//                                         </div>
//                                     </div>
//                                     <button class="btn" onclick="selectPlan(this)">Get Started Today</button>
//                                 </div>
//                                 <h4 class="includes">Startup Plan Includes</h4>
//                                 <ul>
//                                     <a href="#">
//                                         <img
//                                             src={arrow}
//                                             alt=""
//                                         /><li>Monthly Profit & Loss</li></a>
//                                     <a href="#">
//                                         <img
//                                             src={arrow}
//                                             alt=""
//                                         /><li>Balance Sheet</li></a>
//                                     <a href="#">
//                                         <img
//                                             src={arrow}
//                                             alt=""
//                                         />
//                                         <li>Cash Flow Statement</li></a>
//                                     <a href="#">
//                                         <img
//                                             src={arrow}
//                                             alt=""
//                                         />
//                                         <li>Cash Flow Statement</li></a>
//                                     <a href="#">
//                                         <img
//                                             src={arrow}
//                                             alt=""
//                                         />
//                                         <li>Cash Flow Statement</li></a>

//                                 </ul>
//                             </div>
//                             <div class="card popular">
//                                 <div class="badge">Most Popular</div>
//                                 <div className="upper_wrapper">
//                                     <div className="upper_sec">
//                                         <img
//                                             src={payment}
//                                             alt=""
//                                         />
//                                         <div className="heading_card">
//                                             <h3>Essentials</h3>
//                                             <p class="desc">For growing teams or businesses making upto $3M a year .  </p>
//                                         </div>

//                                         <div className=" pricing_wrapper"><h3 className="Pricing_input">$399</h3>
//                                             <div>
//                                                 <p>per month</p>
//                                                 <span>billed annually</span>
//                                             </div>
//                                         </div>
//                                     </div>
//                                     <button class="btn" onclick="selectPlan(this)">Get Started Today</button>
//                                 </div>
//                                 <h4 class="includes">Startup Plan Includes</h4>
//                                 <ul>
//                                     <a href="#">
//                                         <img
//                                             src={arrow}
//                                             alt=""
//                                         /><li>Monthly Profit & Loss</li></a>
//                                     <a href="#">
//                                         <img
//                                             src={arrow}
//                                             alt=""
//                                         /><li>Balance Sheet</li></a>
//                                     <a href="#">
//                                         <img
//                                             src={arrow}
//                                             alt=""
//                                         />
//                                         <li>Cash Flow Statement</li></a>
//                                     <a href="#">
//                                         <img
//                                             src={arrow}
//                                             alt=""
//                                         />
//                                         <li>Cash Flow Statement</li></a>
//                                     <a href="#">
//                                         <img
//                                             src={arrow}
//                                             alt=""
//                                         />
//                                         <li>Cash Flow Statement</li></a>

//                                 </ul>
//                             </div>
//                             <div class="card">
//                                 <div className="upper_wrapper">
//                                     <div className="upper_sec">
//                                         <img
//                                             src={payment}
//                                             alt=""
//                                         />
//                                         <div className="heading_card">
//                                             <h3>Enterprise</h3>
//                                             <p class="desc">Best for solo founders or business under $750k in annual revenue</p>
//                                         </div>

//                                         <div className=" pricing_wrapper"><h3 className="Pricing_input">Contact Us</h3>
//                                         </div>
//                                     </div>
//                                     <button class="btn" onclick="selectPlan(this)">Schedule a Call</button>
//                                 </div>
//                                 <h4 class="includes">Startup Plan Includes</h4>
//                                 <ul>
//                                     <a href="#">
//                                         <img
//                                             src={arrow}
//                                             alt=""
//                                         /><li>Monthly Profit & Loss</li></a>
//                                     <a href="#">
//                                         <img
//                                             src={arrow}
//                                             alt=""
//                                         /><li>Balance Sheet</li></a>
//                                     <a href="#">
//                                         <img
//                                             src={arrow}
//                                             alt=""
//                                         />
//                                         <li>Cash Flow Statement</li></a>
//                                     <a href="#">
//                                         <img
//                                             src={arrow}
//                                             alt=""
//                                         />
//                                         <li>Cash Flow Statement</li></a>
//                                     <a href="#">
//                                         <img
//                                             src={arrow}
//                                             alt=""
//                                         />
//                                         <li>Cash Flow Statement</li></a>

//                                 </ul>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default Payment


import { useState, useEffect } from 'react';
import "../../Assets/Styles/Onboarding/Payment.css"
import logo from "../../Assets/images/plutus-logo.svg";
import payment from "../../Assets/images/clip-path.svg";
import arrow from "../../Assets/images/right_arrow.svg";

const Payment = () => {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [animationStage, setAnimationStage] = useState('initial'); // initial, selected, moving, form

    const selectPlan = (planType, buttonElement) => {
        setSelectedPlan(planType);

        // Stage 1: Scale up selected, fade others
        setAnimationStage('selected');

        // Stage 2: Fade out button and start moving
        setTimeout(() => {
            setAnimationStage('moving');

            // Stage 3: Show payment form
            setTimeout(() => {
                setAnimationStage('form');
            }, 400);
        }, 600);
    };

    const resetAnimation = () => {
        setSelectedPlan(null);
        setAnimationStage('initial');
    };

    const getCardClass = (planType) => {
        let baseClass = 'card';
        if (planType === 'essentials') baseClass += ' popular';

        if (animationStage === 'initial') return baseClass;

        if (selectedPlan === planType) {
            if (animationStage === 'selected') return baseClass + ' selected';
            if (animationStage === 'moving' || animationStage === 'form') return baseClass + ' moving';
        } else {
            if (animationStage !== 'initial') return baseClass + ' unselected';
        }

        return baseClass;
    };

    return (
        <div className="main_wrapper">
            <div className="payment_container">
                <div className="logo-sec">
                    <img src={logo} alt="" />
                </div>
                <div className="payment-sec text-center">
                    <div className="payment-heading">
                        <h4>Choose the <span>Best Plan</span> for you</h4>
                        <p>Stress-free, CPA-backend bookkeeping - built for modern founders.</p>
                    </div>
                    <div className="payment_cards_wrapper">
                        <div className="payment_cards_sec">
                            {/* Startup Plan */}
                            <div className={getCardClass('startup')} data-plan="startup">
                                <div className="upper_wrapper">
                                    <div className="upper_sec">
                                        <img src={payment} alt="" />
                                        <div className="heading_card">
                                            <h3>Startup</h3>
                                            <p className="desc">Best for solo founders or business under $750k in annual revenue</p>
                                        </div>
                                        <div className="pricing_wrapper">
                                            <h3 className="Pricing_input">$199</h3>
                                            <div>
                                                <p>per month</p>
                                                <span>billed annually</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className={`btn ${selectedPlan === 'startup' && animationStage !== 'initial' ? 'fade-out' : ''}`}
                                        onClick={(e) => selectPlan('startup', e.target)}
                                    >
                                        Get Started Today
                                    </button>
                                </div>
                                <h4 className="includes">Startup Plan Includes</h4>
                                <ul>
                                    <a href="#">
                                        <img src={arrow} alt="" />
                                        <li>Monthly Profit & Loss</li>
                                    </a>
                                    <a href="#">
                                        <img src={arrow} alt="" />
                                        <li>Balance Sheet</li>
                                    </a>
                                    <a href="#">
                                        <img src={arrow} alt="" />
                                        <li>Cash Flow Statement</li>
                                    </a>
                                    <a href="#">
                                        <img src={arrow} alt="" />
                                        <li>Tax Preparation Support</li>
                                    </a>
                                    <a href="#">
                                        <img src={arrow} alt="" />
                                        <li>Basic Analytics</li>
                                    </a>
                                </ul>
                            </div>

                            {/* Essentials Plan */}
                            <div className={getCardClass('essentials')} data-plan="essentials">
                                <div className="badge">Most Popular</div>
                                <div className="upper_wrapper">
                                    <div className="upper_sec">
                                        <img src={payment} alt="" />
                                        <div className="heading_card">
                                            <h3>Essentials</h3>
                                            <p className="desc">For growing teams or businesses making upto $3M a year.</p>
                                        </div>
                                        <div className="pricing_wrapper">
                                            <h3 className="Pricing_input">$399</h3>
                                            <div>
                                                <p>per month</p>
                                                <span>billed annually</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className={`btn ${selectedPlan === 'essentials' && animationStage !== 'initial' ? 'fade-out' : ''}`}
                                        onClick={(e) => selectPlan('essentials', e.target)}
                                    >
                                        Get Started Today
                                    </button>
                                </div>
                                <h4 className="includes">Essentials Plan Includes</h4>
                                <ul>
                                    <a href="#">
                                        <img src={arrow} alt="" />
                                        <li>Monthly Profit & Loss</li>
                                    </a>
                                    <a href="#">
                                        <img src={arrow} alt="" />
                                        <li>Balance Sheet</li>
                                    </a>
                                    <a href="#">
                                        <img src={arrow} alt="" />
                                        <li>Cash Flow Statement</li>
                                    </a>
                                    <a href="#">
                                        <img src={arrow} alt="" />
                                        <li>Advanced Analytics</li>
                                    </a>
                                    <a href="#">
                                        <img src={arrow} alt="" />
                                        <li>Priority Support</li>
                                    </a>
                                </ul>
                            </div>

                            {/* Enterprise Plan */}
                            <div className={getCardClass('enterprise')} data-plan="enterprise">
                                <div className="upper_wrapper">
                                    <div className="upper_sec">
                                        <img src={payment} alt="" />
                                        <div className="heading_card">
                                            <h3>Enterprise</h3>
                                            <p className="desc">Best for large businesses with custom requirements</p>
                                        </div>
                                        <div className="pricing_wrapper">
                                            <h3 className="Pricing_input">Contact Us</h3>
                                        </div>
                                    </div>
                                    <button
                                        className={`btn ${selectedPlan === 'enterprise' && animationStage !== 'initial' ? 'fade-out' : ''}`}
                                        onClick={(e) => selectPlan('enterprise', e.target)}
                                    >
                                        Schedule a Call
                                    </button>
                                </div>
                                <h4 className="includes">Enterprise Plan Includes</h4>
                                <ul>
                                    <a href="#">
                                        <img src={arrow} alt="" />
                                        <li>Everything in Essentials</li>
                                    </a>
                                    <a href="#">
                                        <img src={arrow} alt="" />
                                        <li>Custom Integrations</li>
                                    </a>
                                    <a href="#">
                                        <img src={arrow} alt="" />
                                        <li>Dedicated Account Manager</li>
                                    </a>
                                    <a href="#">
                                        <img src={arrow} alt="" />
                                        <li>24/7 Priority Support</li>
                                    </a>
                                    <a href="#">
                                        <img src={arrow} alt="" />
                                        <li>Custom Reporting</li>
                                    </a>
                                </ul>
                            </div>
                        </div>
                    </div>  

                    {/* Payment Form */}
                    <div className={`payment-form ${animationStage === 'form' ? 'show' : ''}`} id="paymentForm">
                        <div className="payment_inner_wrapper">
                            <div className="payment_top_wrapper">
                                <h2>Billing Information</h2>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" placeholder="John Doe" />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" placeholder="john@example.com" />
                                </div>
                                <div className="form-group">
                                    <label>Address</label>
                                    <input type="text" placeholder="1234 5678 9012 3456" />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>City</label>
                                        <input type="text" placeholder="MM/YY" />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>State</label>
                                        <input type="text" placeholder="123" />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Zip</label>
                                        <input type="text" placeholder="123" />
                                    </div>
                                </div>
                            </div>
                            <div className="payment_bottom_wrapper">
                                <h2>Payment Information</h2>
                                <div className="form-group">
                                    <label>Card Number</label>
                                    <input type="text" placeholder="1234 5678 9101 1121" />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Expire State</label>
                                        <input type="text" placeholder="MM/YY" />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>CVC</label>
                                        <input type="text" placeholder="123" />
                                    </div>
                                </div>
                                <div className="btn-grp">
                                    <button className="reset-button" onClick={resetAnimation}>← Back</button>
                                    <button className="payment-button">Pay Now</button>

                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;

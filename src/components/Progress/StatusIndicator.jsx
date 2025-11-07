import React from 'react';
import { Tooltip } from 'react-tooltip';
import './StatusIndicator.css';

/**
 * Generic Status Indicator Component
 * @param {boolean} status - The status to display (true/false)
 * @param {string} type - Type of indicator ('success', 'warning', 'error', 'info')
 * @param {string} tooltip - Tooltip text
 * @param {string} id - Unique ID for tooltip
 * @param {React.ReactNode} children - Content to display
 */
const StatusIndicator = ({ status, type = 'info', tooltip, id, children }) => {
    const classNames = `status-indicator status-${type} ${status ? 'active' : 'inactive'}`;
    
    return (
        <>
            <span 
                className={classNames}
                data-tooltip-id={id}
                data-tooltip-content={tooltip}
            >
                {children}
            </span>
            {tooltip && <Tooltip id={id} />}
        </>
    );
};

/**
 * Onboarding Status Indicator
 * @param {Object} onboarding - Onboarding data
 * @param {boolean} onboarding.completed - Whether onboarding is completed
 * @param {number} onboarding.step - Current step if not completed
 */
export const OnboardingStatus = ({ onboarding, clientId }) => {
    const tooltipId = `onboarding-${clientId}`;
    
    if (onboarding.completed) {
        return (
            <StatusIndicator
                status={true}
                type="success"
                tooltip="Onboarding completed"
                id={tooltipId}
            >
                ✅
            </StatusIndicator>
        );
    }
    
    const stepText = onboarding.step ? `Step ${onboarding.step}` : 'Not started';
    return (
        <StatusIndicator
            status={false}
            type="error"
            tooltip={`Onboarding incomplete - ${stepText}`}
            id={tooltipId}
        >
            ❌
        </StatusIndicator>
    );
};

/**
 * Subscription Status Indicator
 * @param {Object} subscription - Subscription data
 * @param {string} subscription.status - Status ('active', 'trial', 'expired', 'none')
 * @param {string} subscription.planName - Plan name if exists
 */
export const SubscriptionStatus = ({ subscription, clientId }) => {
    const tooltipId = `subscription-${clientId}`;
    
    const getStatusDisplay = () => {
        switch (subscription.status) {
            case 'active':
                return {
                    emoji: '💳',
                    type: 'success',
                    text: 'Active',
                    tooltip: `Active - ${subscription.planName || 'Standard'} (${subscription.interval || 'monthly'})`
                };
            case 'trial':
                return {
                    emoji: '🎁',
                    type: 'warning',
                    text: 'Trial',
                    tooltip: `Trial period - ${subscription.planName || 'Standard'}`
                };
            case 'expired':
                return {
                    emoji: '⚠️',
                    type: 'error',
                    text: 'Expired',
                    tooltip: 'Subscription expired'
                };
            case 'none':
            default:
                return {
                    emoji: '❌',
                    type: 'error',
                    text: 'None',
                    tooltip: 'No subscription'
                };
        }
    };
    
    const status = getStatusDisplay();
    
    return (
        <StatusIndicator
            status={subscription.status === 'active' || subscription.status === 'trial'}
            type={status.type}
            tooltip={status.tooltip}
            id={tooltipId}
        >
            <span className="status-text">
                <span className="status-emoji">{status.emoji}</span>
                <span className="status-label">{status.text}</span>
            </span>
        </StatusIndicator>
    );
};

/**
 * Integration Status Indicator
 * @param {string} platform - Platform name ('amazon', 'shopify')
 * @param {boolean} connected - Whether the integration is connected
 */
export const IntegrationStatus = ({ platform, connected, clientId }) => {
    const tooltipId = `${platform}-${clientId}`;
    const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
    
    if (connected) {
        return (
            <StatusIndicator
                status={true}
                type="success"
                tooltip={`${platformName} connected`}
                id={tooltipId}
            >
                ✅
            </StatusIndicator>
        );
    }
    
    return (
        <StatusIndicator
            status={false}
            type="error"
            tooltip={`${platformName} not connected`}
            id={tooltipId}
        >
            ❌
        </StatusIndicator>
    );
};

/**
 * Combined Progress Indicators Row
 * @param {Object} progress - Complete progress data
 * @param {string} clientId - Client ID for unique tooltip IDs
 */
export const ProgressIndicators = ({ progress, clientId }) => {
    if (!progress) {
        return <span className="no-progress-data">No data</span>;
    }
    
    return (
        <div className="progress-indicators-row">
            <div className="indicator-group">
                <span className="indicator-label">Onboarding:</span>
                <OnboardingStatus onboarding={progress.onboarding} clientId={clientId} />
            </div>
            
            <div className="indicator-group">
                <span className="indicator-label">Subscription:</span>
                <SubscriptionStatus subscription={progress.subscription} clientId={clientId} />
            </div>
            
            <div className="indicator-group">
                <span className="indicator-label">Amazon:</span>
                <IntegrationStatus 
                    platform="amazon" 
                    connected={progress.integrations?.amazon} 
                    clientId={clientId} 
                />
            </div>
            
            <div className="indicator-group">
                <span className="indicator-label">Shopify:</span>
                <IntegrationStatus 
                    platform="shopify" 
                    connected={progress.integrations?.shopify} 
                    clientId={clientId} 
                />
            </div>
        </div>
    );
};

export default StatusIndicator;
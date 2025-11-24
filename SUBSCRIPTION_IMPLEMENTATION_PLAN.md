# Subscription Implementation Plan - Google Maps Extractor

## Document Overview

**Project:** Google Maps Extractor Web Application
**Currency:** Indian Rupees (₹)
**Date:** November 23, 2025
**Version:** 1.0

---

## Table of Contents

1. [Pricing Structure](#pricing-structure)
2. [Subscription Tiers](#subscription-tiers)
3. [Technical Implementation](#technical-implementation)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Payment Gateway Integration](#payment-gateway-integration)
7. [Quota Management](#quota-management)
8. [User Flow](#user-flow)
9. [Implementation Phases](#implementation-phases)
10. [Testing Plan](#testing-plan)

---

## Pricing Structure

### Subscription Tiers (INR)

| Tier | Price (₹/month) | Extractions/Month | Results/Extraction | History | Support | Features |
|------|----------------|-------------------|-------------------|---------|---------|----------|
| **Free** | ₹0 | 10 | 10 | 7 days | Community | Basic filters, CSV export |
| **Starter** | ₹499 | 100 | 50 | 30 days | Email | Advanced filters, Priority processing |
| **Professional** | ₹1,499 | 500 | 100 | 90 days | Priority Email | All filters, Bulk export, API access |
| **Business** | ₹4,999 | 2,000 | 200 | Unlimited | Phone + Email | White-label, Webhooks, Dedicated support |
| **Enterprise** | Custom | Unlimited | Unlimited | Unlimited | Dedicated Manager | Custom integrations, SLA, On-premise option |

---

## Subscription Tiers (Detailed)

### 1. Free Tier (₹0/month)

**Target Audience:** Individual users, hobbyists, testing

**Limits:**
- **10 extractions per month**
- **10 results per extraction** (max 100 results total/month)
- Resets on 1st of every month
- 7-day extraction history
- Basic filters only
- CSV export enabled
- Community support (FAQ, Documentation)

**Restrictions:**
- No API access
- No bulk operations
- Watermark on exports (optional)
- Standard processing priority (queue-based)

**Use Cases:**
- Testing the platform
- Small personal projects
- Occasional business lookups

---

### 2. Starter Tier (₹499/month)

**Target Audience:** Freelancers, small business owners, startups

**Limits:**
- **100 extractions per month**
- **50 results per extraction** (max 5,000 results total/month)
- 30-day extraction history
- Advanced filters (contact, website, rating)
- CSV export enabled
- Email support (24-48 hour response)

**Features:**
- Higher processing priority
- Duplicate detection
- Skip filters (no phone, no website)
- Download all extractions at once
- Export scheduling

**Use Cases:**
- Lead generation for small businesses
- Local SEO projects
- Market research for specific niches

---

### 3. Professional Tier (₹1,499/month)

**Target Audience:** Marketing agencies, sales teams, consultants

**Limits:**
- **500 extractions per month**
- **100 results per extraction** (max 50,000 results total/month)
- 90-day extraction history
- All filters available
- Multiple CSV formats
- Priority email support (12-24 hour response)

**Features:**
- API access (1,000 calls/month)
- Bulk export (multiple extractions)
- Advanced analytics dashboard
- Custom fields selection
- Webhook notifications
- Team collaboration (up to 3 users)

**Use Cases:**
- Digital marketing agencies
- Sales prospecting teams
- Competitive analysis
- Multi-location business research

---

### 4. Business Tier (₹4,999/month)

**Target Audience:** Enterprises, large agencies, data companies

**Limits:**
- **2,000 extractions per month**
- **200 results per extraction** (max 400,000 results total/month)
- Unlimited extraction history
- White-label option
- Phone + email support (4-12 hour response)

**Features:**
- API access (10,000 calls/month)
- Webhook integrations
- Custom integrations (CRM, Google Sheets, etc.)
- Priority processing (highest)
- Team collaboration (up to 10 users)
- Advanced reporting
- Data retention policies
- IP whitelisting

**Use Cases:**
- Large-scale lead generation
- Market intelligence platforms
- Business data providers
- Multi-client agency operations

---

### 5. Enterprise Tier (Custom Pricing)

**Target Audience:** Corporations, data platforms, resellers

**Limits:**
- **Unlimited extractions**
- **Unlimited results per extraction**
- Unlimited history
- Dedicated account manager
- 24/7 phone + email support
- Custom SLA (99.9% uptime guarantee)

**Features:**
- Unlimited API access
- Custom rate limits
- On-premise deployment option
- Custom data retention
- Advanced security (SSO, SAML)
- White-label + custom branding
- Custom features development
- Dedicated infrastructure
- Priority feature requests
- Training sessions

**Pricing Structure:**
- Base: ₹25,000/month minimum
- Volume-based pricing
- Custom contract terms (annual, multi-year)

**Use Cases:**
- Enterprise data operations
- Reseller partnerships
- Custom platform integrations
- High-volume data extraction

---

## Technical Implementation

### Phase 1: Database Schema Updates

#### 1.1 Subscription Plans Table

```sql
CREATE TABLE subscription_plans (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  price_inr INT NOT NULL, -- in paise (1 rupee = 100 paise)
  billing_period VARCHAR(20) NOT NULL, -- 'monthly', 'yearly'
  extractions_per_month INT NOT NULL,
  results_per_extraction INT NOT NULL,
  history_retention_days INT, -- NULL for unlimited
  features JSON, -- array of features
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default plans
INSERT INTO subscription_plans VALUES
('plan_free', 'Free', 'free', 0, 'monthly', 10, 10, 7, '["basic_filters", "csv_export"]', true, NOW(), NOW()),
('plan_starter', 'Starter', 'starter', 49900, 'monthly', 100, 50, 30, '["advanced_filters", "priority_processing"]', true, NOW(), NOW()),
('plan_professional', 'Professional', 'professional', 149900, 'monthly', 500, 100, 90, '["api_access", "webhooks", "team_collaboration"]', true, NOW(), NOW()),
('plan_business', 'Business', 'business', 499900, 'monthly', 2000, 200, NULL, '["white_label", "dedicated_support", "custom_integrations"]', true, NOW(), NOW());
```

#### 1.2 User Subscriptions Table

```sql
CREATE TABLE user_subscriptions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  plan_id VARCHAR(36) NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'active', 'cancelled', 'expired', 'past_due'
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMP,
  trial_start TIMESTAMP,
  trial_end TIMESTAMP,

  -- Payment details
  payment_gateway VARCHAR(50), -- 'razorpay', 'stripe', etc.
  subscription_gateway_id VARCHAR(255), -- Gateway's subscription ID
  customer_gateway_id VARCHAR(255), -- Gateway's customer ID

  -- Metadata
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
  INDEX idx_user_status (user_id, status),
  INDEX idx_period_end (current_period_end)
);
```

#### 1.3 Usage Tracking Table

```sql
CREATE TABLE usage_tracking (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  subscription_id VARCHAR(36),
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,

  -- Usage metrics
  extractions_used INT DEFAULT 0,
  extractions_limit INT NOT NULL,
  results_extracted INT DEFAULT 0,

  -- API usage (for paid plans)
  api_calls_used INT DEFAULT 0,
  api_calls_limit INT DEFAULT 0,

  -- Reset tracking
  last_reset_at TIMESTAMP,
  next_reset_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id),
  INDEX idx_user_period (user_id, period_start, period_end)
);
```

#### 1.4 Payment Transactions Table

```sql
CREATE TABLE payment_transactions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  subscription_id VARCHAR(36),

  -- Transaction details
  amount INT NOT NULL, -- in paise
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(20) NOT NULL, -- 'pending', 'success', 'failed', 'refunded'
  transaction_type VARCHAR(20) NOT NULL, -- 'subscription', 'upgrade', 'renewal', 'refund'

  -- Gateway details
  payment_gateway VARCHAR(50),
  gateway_transaction_id VARCHAR(255),
  gateway_order_id VARCHAR(255),
  payment_method VARCHAR(50), -- 'card', 'upi', 'netbanking', etc.

  -- Metadata
  invoice_id VARCHAR(255),
  receipt_url TEXT,
  failure_reason TEXT,
  metadata JSON,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id),
  INDEX idx_user_status (user_id, status),
  INDEX idx_gateway_transaction (gateway_transaction_id)
);
```

#### 1.5 Update Users Table

```sql
ALTER TABLE users ADD COLUMN current_plan_id VARCHAR(36) DEFAULT 'plan_free';
ALTER TABLE users ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN trial_used BOOLEAN DEFAULT false;
ALTER TABLE users ADD FOREIGN KEY (current_plan_id) REFERENCES subscription_plans(id);
```

---

## API Endpoints

### Subscription Management Endpoints

#### 1. Get Available Plans

```typescript
GET /api/subscription/plans

Response:
{
  "plans": [
    {
      "id": "plan_free",
      "name": "Free",
      "slug": "free",
      "price": 0,
      "priceFormatted": "₹0",
      "billingPeriod": "monthly",
      "limits": {
        "extractionsPerMonth": 10,
        "resultsPerExtraction": 10,
        "historyRetentionDays": 7
      },
      "features": ["basic_filters", "csv_export"]
    },
    // ... other plans
  ]
}
```

#### 2. Get Current Subscription

```typescript
GET /api/subscription/current

Response:
{
  "subscription": {
    "id": "sub_123",
    "planId": "plan_starter",
    "planName": "Starter",
    "status": "active",
    "currentPeriodStart": "2025-01-01T00:00:00Z",
    "currentPeriodEnd": "2025-02-01T00:00:00Z",
    "cancelAtPeriodEnd": false
  },
  "usage": {
    "extractionsUsed": 23,
    "extractionsLimit": 100,
    "extractionsRemaining": 77,
    "resultsExtracted": 1150,
    "periodStart": "2025-01-01T00:00:00Z",
    "periodEnd": "2025-02-01T00:00:00Z",
    "resetDate": "2025-02-01T00:00:00Z"
  }
}
```

#### 3. Create Subscription (Upgrade)

```typescript
POST /api/subscription/create

Request:
{
  "planId": "plan_starter",
  "billingPeriod": "monthly"
}

Response:
{
  "subscriptionId": "sub_123",
  "paymentUrl": "https://razorpay.com/pay/...",
  "orderId": "order_123",
  "amount": 49900,
  "currency": "INR"
}
```

#### 4. Cancel Subscription

```typescript
POST /api/subscription/cancel

Request:
{
  "subscriptionId": "sub_123",
  "cancelAtPeriodEnd": true,
  "reason": "Too expensive"
}

Response:
{
  "success": true,
  "subscription": {
    "status": "active",
    "cancelAtPeriodEnd": true,
    "currentPeriodEnd": "2025-02-01T00:00:00Z"
  }
}
```

#### 5. Get Usage Statistics

```typescript
GET /api/subscription/usage

Response:
{
  "currentPeriod": {
    "extractionsUsed": 23,
    "extractionsLimit": 100,
    "resultsExtracted": 1150,
    "apiCallsUsed": 45,
    "apiCallsLimit": 1000
  },
  "history": [
    {
      "period": "2024-12",
      "extractionsUsed": 87,
      "resultsExtracted": 4350
    },
    // ... previous months
  ]
}
```

#### 6. Get Invoices

```typescript
GET /api/subscription/invoices

Response:
{
  "invoices": [
    {
      "id": "inv_123",
      "date": "2025-01-01T00:00:00Z",
      "amount": 49900,
      "amountFormatted": "₹499.00",
      "status": "paid",
      "invoiceUrl": "https://...",
      "receiptUrl": "https://..."
    }
  ]
}
```

---

## Payment Gateway Integration

### Recommended: Razorpay (India-focused)

#### Why Razorpay?
- Indian company, INR native
- Supports all Indian payment methods (UPI, cards, netbanking, wallets)
- Easy integration
- Lower fees for Indian transactions
- Good documentation
- Subscription management built-in

#### Alternative: Stripe

- International standard
- Higher fees for INR
- Better for global expansion

---

### Razorpay Integration Steps

#### 1. Install Razorpay SDK

```bash
# Backend
npm install razorpay

# Frontend
npm install razorpay
```

#### 2. Backend Service (NestJS)

**File:** `backend/src/subscription/razorpay.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import Razorpay from 'razorpay';

@Injectable()
export class RazorpayService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async createSubscription(planId: string, customerId: string) {
    // Create subscription in Razorpay
    const subscription = await this.razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // 12 months
      quantity: 1,
    });

    return subscription;
  }

  async createOrder(amount: number, currency: string = 'INR') {
    const order = await this.razorpay.orders.create({
      amount: amount, // in paise
      currency: currency,
      receipt: `receipt_${Date.now()}`,
    });

    return order;
  }

  async verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): Promise<boolean> {
    const crypto = require('crypto');
    const text = orderId + '|' + paymentId;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    return generated_signature === signature;
  }

  async cancelSubscription(subscriptionId: string) {
    return await this.razorpay.subscriptions.cancel(subscriptionId);
  }

  async fetchSubscription(subscriptionId: string) {
    return await this.razorpay.subscriptions.fetch(subscriptionId);
  }
}
```

#### 3. Subscription Service

**File:** `backend/src/subscription/subscription.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RazorpayService } from './razorpay.service';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel('UserSubscription') private subscriptionModel: Model<any>,
    @InjectModel('UsageTracking') private usageModel: Model<any>,
    private razorpayService: RazorpayService,
  ) {}

  async createSubscription(userId: string, planId: string) {
    // Get plan details
    const plan = await this.getPlanById(planId);

    // Create order in Razorpay
    const order = await this.razorpayService.createOrder(
      plan.price_inr,
      'INR',
    );

    // Create subscription record (pending)
    const subscription = await this.subscriptionModel.create({
      userId,
      planId,
      status: 'pending',
      paymentGateway: 'razorpay',
      gatewayOrderId: order.id,
      currentPeriodStart: new Date(),
      currentPeriodEnd: this.calculatePeriodEnd(new Date(), 'monthly'),
    });

    return {
      subscriptionId: subscription.id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  }

  async activateSubscription(subscriptionId: string, paymentDetails: any) {
    // Verify payment signature
    const isValid = await this.razorpayService.verifyPaymentSignature(
      paymentDetails.orderId,
      paymentDetails.paymentId,
      paymentDetails.signature,
    );

    if (!isValid) {
      throw new Error('Invalid payment signature');
    }

    // Update subscription status
    const subscription = await this.subscriptionModel.findByIdAndUpdate(
      subscriptionId,
      {
        status: 'active',
        startDate: new Date(),
        subscriptionGatewayId: paymentDetails.subscriptionId,
      },
      { new: true },
    );

    // Create usage tracking
    await this.createUsageTracking(subscription);

    return subscription;
  }

  async checkQuota(userId: string): Promise<{
    canExtract: boolean;
    extractionsRemaining: number;
    resultsLimit: number;
  }> {
    const usage = await this.getCurrentUsage(userId);
    const subscription = await this.getCurrentSubscription(userId);

    const plan = await this.getPlanById(subscription.planId);

    const extractionsRemaining =
      plan.extractions_per_month - usage.extractionsUsed;

    return {
      canExtract: extractionsRemaining > 0,
      extractionsRemaining,
      resultsLimit: plan.results_per_extraction,
    };
  }

  async incrementUsage(userId: string, resultsCount: number) {
    const usage = await this.getCurrentUsage(userId);

    await this.usageModel.findByIdAndUpdate(usage.id, {
      $inc: {
        extractionsUsed: 1,
        resultsExtracted: resultsCount,
      },
    });
  }

  private calculatePeriodEnd(start: Date, period: string): Date {
    const end = new Date(start);
    if (period === 'monthly') {
      end.setMonth(end.getMonth() + 1);
    } else if (period === 'yearly') {
      end.setFullYear(end.getFullYear() + 1);
    }
    return end;
  }
}
```

#### 4. Frontend Payment Integration

**File:** `frontend/src/components/SubscriptionCheckout.tsx`

```typescript
'use client';

import { useState } from 'react';
import { subscriptionAPI } from '@/lib/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SubscriptionCheckout({ plan }: { plan: any }) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);

    try {
      // Create order
      const { data } = await subscriptionAPI.createSubscription({
        planId: plan.id,
        billingPeriod: 'monthly',
      });

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          order_id: data.orderId,
          name: 'Google Maps Extractor',
          description: `${plan.name} Plan Subscription`,
          handler: async (response: any) => {
            // Verify payment
            await subscriptionAPI.verifyPayment({
              subscriptionId: data.subscriptionId,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            // Redirect to dashboard
            window.location.href = '/dashboard?subscription=success';
          },
          prefill: {
            email: user.email,
            contact: user.phone,
          },
          theme: {
            color: '#3B82F6',
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="btn-primary"
    >
      {loading ? 'Processing...' : `Subscribe for ₹${plan.price}`}
    </button>
  );
}
```

---

## Quota Management

### Middleware for Quota Check

**File:** `backend/src/common/guards/quota.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SubscriptionService } from '../../subscription/subscription.service';

@Injectable()
export class QuotaGuard implements CanActivate {
  constructor(private subscriptionService: SubscriptionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;

    const quota = await this.subscriptionService.checkQuota(userId);

    if (!quota.canExtract) {
      throw new ForbiddenException({
        message: 'Monthly extraction quota exceeded',
        quota: {
          extractionsRemaining: 0,
          upgradeUrl: '/subscription/plans',
        },
      });
    }

    // Add quota info to request
    request.quota = quota;

    return true;
  }
}
```

### Apply Guard to Extraction Endpoint

**File:** `backend/src/extraction/extraction.controller.ts`

```typescript
import { Controller, Post, UseGuards } from '@nestjs/common';
import { QuotaGuard } from '../common/guards/quota.guard';

@Controller('extraction')
export class ExtractionController {
  @Post('start')
  @UseGuards(QuotaGuard)
  async startExtraction(@Request() req, @Body() dto: StartExtractionDto) {
    // Limit results based on quota
    const maxResults = Math.min(
      dto.maxResults || 50,
      req.quota.resultsLimit,
    );

    const result = await this.extractionService.startExtraction({
      ...dto,
      maxResults,
      userId: req.user.id,
    });

    // Increment usage
    await this.subscriptionService.incrementUsage(
      req.user.id,
      result.totalResults,
    );

    return result;
  }
}
```

---

## User Flow

### 1. New User Registration

```
1. User registers (Free plan auto-assigned)
2. Create usage_tracking record
3. Set limits: 10 extractions/month, 10 results/extraction
4. User can start extracting immediately
```

### 2. Upgrading to Paid Plan

```
1. User browses pricing page
2. Clicks "Subscribe" on desired plan
3. Redirected to checkout
4. Enter payment details (Razorpay)
5. Payment processed
6. Webhook received (payment success)
7. Subscription activated
8. Usage limits updated
9. User redirected to dashboard
10. Success notification shown
```

### 3. Monthly Usage Reset

```
Cron Job (runs daily at 00:00 IST):
1. Find all usage_tracking records where next_reset_at <= NOW()
2. Reset counters:
   - extractions_used = 0
   - results_extracted = 0
   - api_calls_used = 0
3. Update period dates:
   - period_start = period_end
   - period_end = period_end + 1 month
   - next_reset_at = period_end
4. Send email: "Your quota has been reset"
```

### 4. Subscription Renewal

```
Razorpay Webhook (subscription.charged):
1. Verify webhook signature
2. Update subscription record
3. Update current_period_end
4. Create payment transaction record
5. Send invoice email
6. Reset usage if needed
```

### 5. Subscription Cancellation

```
User-initiated:
1. User clicks "Cancel Subscription"
2. Confirmation modal shown
3. Set cancel_at_period_end = true
4. Cancel in Razorpay
5. User can continue until period_end
6. On period_end, downgrade to Free plan
7. Send cancellation confirmation email
```

---

## Implementation Phases

### Phase 1: Backend Foundation (Week 1-2)

**Tasks:**
- [ ] Create database schema
- [ ] Create subscription models (Mongoose schemas)
- [ ] Implement subscription service
- [ ] Create subscription controller
- [ ] Add quota guard/middleware
- [ ] Update extraction service to check quotas
- [ ] Create usage tracking service
- [ ] Implement quota reset cron job

**Deliverables:**
- Subscription management API
- Quota enforcement system
- Usage tracking system

---

### Phase 2: Payment Integration (Week 2-3)

**Tasks:**
- [ ] Set up Razorpay account
- [ ] Implement Razorpay service
- [ ] Create payment endpoints
- [ ] Implement webhook handlers
- [ ] Add payment verification
- [ ] Create invoice generation
- [ ] Add payment retry logic
- [ ] Implement refund handling

**Deliverables:**
- Working payment system
- Webhook processing
- Invoice generation

---

### Phase 3: Frontend UI (Week 3-4)

**Tasks:**
- [ ] Update landing page pricing
- [ ] Create subscription management page
- [ ] Create plan selection component
- [ ] Create checkout component
- [ ] Create usage dashboard
- [ ] Create invoice history page
- [ ] Add upgrade/downgrade flows
- [ ] Create cancellation flow
- [ ] Add trial banner (if applicable)

**Deliverables:**
- Complete subscription UI
- User-facing quota display
- Payment flow

---

### Phase 4: Testing & Polish (Week 4-5)

**Tasks:**
- [ ] Test all subscription flows
- [ ] Test payment scenarios (success, failure, timeout)
- [ ] Test quota enforcement
- [ ] Test webhook handling
- [ ] Test edge cases (expired subscriptions, etc.)
- [ ] Load testing
- [ ] Security audit
- [ ] Add error handling
- [ ] Add logging and monitoring

**Deliverables:**
- Tested and stable system
- Documentation
- Admin dashboard

---

### Phase 5: Launch Preparation (Week 5-6)

**Tasks:**
- [ ] Set up production Razorpay account
- [ ] Configure production webhooks
- [ ] Set up monitoring alerts
- [ ] Create admin tools
- [ ] Prepare launch communications
- [ ] Train support team
- [ ] Create FAQ/documentation
- [ ] Soft launch to beta users

**Deliverables:**
- Production-ready system
- Support documentation
- Launch plan

---

## Testing Plan

### Unit Tests

```typescript
// subscription.service.spec.ts
describe('SubscriptionService', () => {
  it('should create subscription for valid plan', async () => {
    // Test implementation
  });

  it('should check quota correctly', async () => {
    // Test implementation
  });

  it('should increment usage', async () => {
    // Test implementation
  });

  it('should reset usage on period end', async () => {
    // Test implementation
  });
});
```

### Integration Tests

```typescript
// subscription.e2e.spec.ts
describe('Subscription Flow (e2e)', () => {
  it('should complete full subscription flow', async () => {
    // 1. Create user
    // 2. Select plan
    // 3. Process payment
    // 4. Verify subscription active
    // 5. Check quota updated
  });

  it('should enforce quota limits', async () => {
    // 1. User with 10 extraction limit
    // 2. Make 10 extractions
    // 3. 11th extraction should fail
  });
});
```

### Payment Testing

**Test Cards (Razorpay):**
```
Success: 4111 1111 1111 1111
Failure: 4000 0000 0000 0002
```

**Test Scenarios:**
- [ ] Successful payment
- [ ] Failed payment
- [ ] Payment timeout
- [ ] Duplicate payment prevention
- [ ] Refund processing
- [ ] Subscription renewal
- [ ] Subscription cancellation

---

## Monitoring & Analytics

### Key Metrics to Track

1. **Subscription Metrics:**
   - New subscriptions per day/week/month
   - Churn rate
   - MRR (Monthly Recurring Revenue)
   - ARPU (Average Revenue Per User)
   - Conversion rate (Free → Paid)

2. **Usage Metrics:**
   - Average extractions per user
   - Average results per extraction
   - Quota utilization rate
   - API usage (for paid plans)

3. **Payment Metrics:**
   - Payment success rate
   - Failed payment reasons
   - Refund rate
   - Payment method distribution

### Monitoring Tools

- **Application:** New Relic / DataDog
- **Payments:** Razorpay Dashboard
- **Analytics:** Google Analytics / Mixpanel
- **Errors:** Sentry

---

## Security Considerations

### 1. Payment Security

- Never store card details
- Use Razorpay's PCI-compliant system
- Verify all webhook signatures
- Use HTTPS only
- Implement rate limiting on payment endpoints

### 2. Quota Bypass Prevention

- Server-side quota checks only
- Atomic usage increment
- Transaction-based updates
- Audit logging for quota changes

### 3. Subscription Manipulation

- Verify all state changes
- Log all subscription updates
- Require authentication for all endpoints
- Implement admin approval for manual changes

---

## Migration Plan

### Migrating Existing Users

```sql
-- Script to migrate existing users to Free plan
UPDATE users
SET current_plan_id = 'plan_free',
    subscription_status = 'active'
WHERE current_plan_id IS NULL;

-- Create usage tracking for existing users
INSERT INTO usage_tracking (user_id, extractions_limit, results_limit, period_start, period_end)
SELECT id, 10, 10, NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH)
FROM users
WHERE id NOT IN (SELECT user_id FROM usage_tracking);
```

---

## Admin Dashboard Requirements

### Features Needed:

1. **Subscription Overview:**
   - Total active subscriptions by plan
   - MRR breakdown
   - Churn metrics

2. **User Management:**
   - View user subscriptions
   - Manual plan changes (with reason)
   - Quota adjustments
   - Refund processing

3. **Analytics:**
   - Revenue charts
   - Usage trends
   - Conversion funnels
   - Payment success rates

4. **Support Tools:**
   - Transaction lookup
   - Subscription history
   - Usage history
   - Invoice regeneration

---

## Environment Variables

```bash
# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx

# Frontend
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx

# Subscription Settings
DEFAULT_PLAN_ID=plan_free
TRIAL_PERIOD_DAYS=14
FREE_PLAN_EXTRACTIONS=10
FREE_PLAN_RESULTS_PER_EXTRACTION=10
```

---

## Pricing Psychology & Strategy

### Why These Prices?

**Free (₹0):**
- Low enough to not scare users
- Attracts trial users
- 10 extractions × 10 results = 100 total results/month
- Enough to evaluate the product

**Starter (₹499):**
- Affordable for freelancers
- 10x value over Free plan
- Sweet spot for Indian SMBs
- Clear upgrade path

**Professional (₹1,499):**
- 3x Starter price for 5x value
- Targets agencies and teams
- API access justifies premium

**Business (₹4,999):**
- Enterprise-lite pricing
- 200 results/extraction = serious users
- Unlimited history = data retention value

### Upgrade Incentives

1. **Free → Starter:**
   - "Get 90 more extractions"
   - "Extract up to 50 results at once"
   - "30-day history"

2. **Starter → Professional:**
   - "5x more extractions"
   - "API access included"
   - "Team collaboration"

3. **Professional → Business:**
   - "4x more extractions"
   - "White-label option"
   - "Dedicated support"

---

## Revenue Projections

### Conservative Estimates (Year 1)

| Month | Free Users | Starter | Professional | Business | MRR (₹) |
|-------|-----------|---------|--------------|----------|---------|
| 1 | 100 | 5 | 1 | 0 | 3,994 |
| 3 | 500 | 25 | 5 | 1 | 24,990 |
| 6 | 1,500 | 75 | 15 | 3 | 74,970 |
| 12 | 5,000 | 200 | 50 | 10 | 199,900 |

**Year 1 ARR:** ₹23,98,800 (~₹24 Lakhs)

---

## Support & Documentation

### User Documentation Needed:

1. **Subscription Guide:**
   - How to upgrade/downgrade
   - Billing cycle explanation
   - Cancellation policy
   - Refund policy

2. **Usage Guide:**
   - How quotas work
   - What counts as extraction
   - How to monitor usage
   - Reset schedule

3. **Payment Guide:**
   - Accepted payment methods
   - Invoice access
   - Payment failures
   - Subscription renewal

4. **FAQ:**
   - "What happens when I exceed quota?"
   - "Can I change plans mid-cycle?"
   - "Do unused extractions roll over?" (No)
   - "How do I get a refund?"

---

## Legal & Compliance

### Required Documents:

1. **Terms of Service:**
   - Subscription terms
   - Auto-renewal clause
   - Cancellation policy
   - Usage limits

2. **Privacy Policy:**
   - Payment data handling
   - Data retention
   - Third-party services (Razorpay)

3. **Refund Policy:**
   - 7-day money-back guarantee (optional)
   - Prorated refunds
   - Cancellation process

4. **GST Compliance:**
   - GST registration required (if turnover > ₹20L)
   - 18% GST on services
   - Invoice format compliance

---

## Success Metrics

### KPIs to Track:

1. **Conversion Rate:** Free → Paid > 5%
2. **Churn Rate:** < 5% monthly
3. **MRR Growth:** > 20% month-over-month
4. **ARPU:** > ₹500
5. **LTV:CAC Ratio:** > 3:1

---

## Conclusion

This implementation plan provides a complete roadmap for adding subscription management to the Google Maps Extractor platform. The pricing structure is designed for the Indian market with clear value propositions at each tier.

**Next Steps:**
1. Review and approve pricing structure
2. Set up Razorpay account
3. Begin Phase 1 implementation
4. Schedule weekly progress reviews

**Timeline:** 6 weeks to full production launch

---

**Document Version:** 1.0
**Last Updated:** November 23, 2025
**Owner:** Development Team

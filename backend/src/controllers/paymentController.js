const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');

// @desc    Utwórz sesję płatności Stripe Checkout
// @route   POST /api/payments/create-checkout
const createCheckoutSession = async (req, res) => {
    try {
        const { bookingId } = req.body;

        const booking = await Booking.findById(bookingId).populate('serviceId');
        if (!booking) return res.status(404).json({ message: 'Rezerwacja nie znaleziona.' });
        if (booking.status !== 'temporary_lock') {
            return res.status(400).json({ message: 'Rezerwacja wygasła lub jest już potwierdzona.' });
        }

        const service = booking.serviceId;
        const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'blik'],
            line_items: [{
                price_data: {
                    currency: 'pln',
                    product_data: { name: service.name },
                    unit_amount: Math.round(service.price * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${FRONTEND_URL}/summary/${bookingId}?payment=success`,
            cancel_url: `${FRONTEND_URL}/summary/${bookingId}?payment=cancel`,
            metadata: { bookingId: bookingId.toString() },
        });

        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ message: 'Błąd przy tworzeniu sesji płatności', error: error.message });
    }
};

// @desc    Webhook Stripe — potwierdź rezerwację po opłaceniu
// @route   POST /api/payments/webhook
const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).json({ message: `Webhook Error: ${err.message}` });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { bookingId } = session.metadata;

        let paymentMethod = 'card';
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent, {
                expand: ['payment_method'],
            });
            const pmType = paymentIntent.payment_method?.type;
            if (pmType === 'blik') paymentMethod = 'blik';
        } catch (_) {}

        await Booking.findByIdAndUpdate(bookingId, {
            status: 'confirmed',
            paymentMethod,
            paymentStatus: 'paid',
            expiresAt: undefined,
        });
    }

    res.json({ received: true });
};

module.exports = { createCheckoutSession, handleStripeWebhook };

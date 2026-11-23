export const notifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ customer: req.customer.id });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
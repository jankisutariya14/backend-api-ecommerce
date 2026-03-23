const Contact = require('../model/ContactModel');

// Handle customer inquiry from frontend
exports.submitInquiry = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const newInquiry = new Contact({ name, email, subject, message });
        await newInquiry.save();
        res.status(201).json({ success: true, message: "Inquiry submitted successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error submitting inquiry.", error: error.message });
    }
};

// Admin: Get all inquiries
exports.getInquiries = async (req, res) => {
    try {
        const inquiries = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: inquiries });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching inquiries.", error: error.message });
    }
};

// Admin: Delete inquiry
exports.deleteInquiry = async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Inquiry deleted successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting inquiry.", error: error.message });
    }
};

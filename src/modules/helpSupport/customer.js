import asyncHandler from "../../utils/asyncHandler.js";
import apiResponse from "../../utils/apiResponse.js";

const customerHelpSupport = {
  name: "CBSG Customer Support",
  phone: "9999999999",
  questions: [
    {
      question: "How do I complete my profile?",
      answer:
        "After login, save your father's name, date of birth, and upload your Aadhaar and PAN documents.",
    },
    {
      question: "How do I add my bank account?",
      answer:
        "Open Bank and enter the bank name, account number, and IFSC code. Use update if those details change.",
    },
    {
      question: "How does KYC verification work?",
      answer:
        "Mark each section as done from KYC. When every section is done, the status moves to under review. Support will update it after verification.",
    },
    {
      question: "I did not receive the login OTP. What should I do?",
      answer:
        "Check that the mobile number is correct and request a new OTP after a minute. If it still does not arrive, call the support number.",
    },
    {
      question: "How do I log out of this device?",
      answer:
        "Use logout. Pass the refresh token or the device FCM token if you want that token removed from this account.",
    },
  ],
};

const helpSupport = asyncHandler(async (req, res) => {
  return apiResponse(
    res,
    200,
    "Help and support fetched successfully",
    customerHelpSupport
  );
});

export { customerHelpSupport, helpSupport };

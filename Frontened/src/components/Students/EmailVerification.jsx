import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Mail,
  Send,
  CheckCircle,
  ArrowRight,
  UtensilsCrossed
} from 'lucide-react';
const EmailVerification = ({ data, updateData, onNext }) => {
  const sectionRef = useRef(null);
  const [email, setEmail] = useState(data.email || '');
  const [otp, setOtp] = useState(data.otp || '');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(0);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const sendVerificationCode = async () => {
  setErrors({});
  if (!email) return setErrors({ email: 'Email is required' });
  if (!validateEmail(email)) return setErrors({ email: 'Please enter a valid email address' });

  setIsSending(true);
  try {
    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/send-verification-code`, { email });
    setIsEmailSent(true);
    setTimer(60);
    updateData({ email });
    setSuccessMessage("Verification code sent successfully!");
  } catch (err) {
    setErrors({ email: err.response?.data?.error || 'Failed to send verification code' });
  } finally {
    setIsSending(false);
  }
};


  const verifyCode = async () => {
    setErrors({});
    if (!otp) return setErrors({ code: 'Verification code is required' });
    if (otp.length !== 6) return setErrors({ code: 'Verification code must be 6 digits' });

    setIsVerifying(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/verify-code`, { email, otp });
      setIsVerifying(false);
      updateData({ otp });
      onNext();
    } catch (err) {
      setIsVerifying(false);
      setErrors({ code: err.response?.data?.error || 'Invalid verification code' });
    }
  };

  const resendCode = () => {
    sendVerificationCode();
  };

  return (
    <div ref={sectionRef} className="max-w-lg mx-auto">
      <div className="text-center mb-10">
        {/* 👇 Modern small round icon */}
        {/* <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
          <Mail className="w-5 h-5 text-orange-600" />
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-3">Verify Your Student Email</h2>
        <p className="text-lg text-gray-600">
          {!isEmailSent
            ? 'Enter your student email to access FoodieHub services'
            : "We've sent a delicious verification code to your email!"}
        </p> */}
      </div>

      {!isEmailSent ? (
        <div className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
              Student Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 text-lg ${
                  errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-orange-300'
                }`}
                placeholder="student@university.edu"
              />
              <UtensilsCrossed className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                <span className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">!</span>
                {errors.email}
              </p>
            )}
          </div>

          <button
  onClick={sendVerificationCode}
  disabled={isSending}
  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 px-6 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 font-semibold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
>
  {isSending ? (
    <>
      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
      Sending...
    </>
  ) : (
    <>
      <Send className="w-6 h-6" />
      Send Verification Code
    </>
  )}
</button>


          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
            <p className="text-orange-800 text-sm text-center">
              <strong>🍽️ Why verify?</strong> Access meal plans, canteen ordering, dietary preferences, and exclusive food offers!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-green-800 font-semibold">Code sent successfully!</span>
              <p className="text-green-700 text-sm">Check your inbox at {email}</p>
            </div>
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-3">
              Enter 6-Digit Verification Code
            </label>
            <input
              type="text"
              id="code"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 text-center text-2xl font-mono tracking-widest ${
                errors.code ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-orange-300'
              }`}
              placeholder="● ● ● ● ● ●"
              maxLength={6}
            />
            {errors.code && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                <span className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">!</span>
                {errors.code}
              </p>
            )}
          </div>

          <button
            onClick={verifyCode}
            disabled={isVerifying}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 px-6 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 font-semibold text-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            {isVerifying ? (
              <>
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Verify & Continue
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>

          <div className="text-center">
            {timer > 0 ? (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg py-2 px-4">
                🕐 Resend code in <span className="font-semibold text-orange-600">{timer}</span> seconds
              </p>
            ) : (
              <button
                onClick={resendCode}
                className="text-sm text-orange-600 hover:text-orange-700 transition-colors font-semibold bg-orange-50 hover:bg-orange-100 rounded-lg py-2 px-4"
              >
                📧 Didn't receive the code? Resend now
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailVerification;

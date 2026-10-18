import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Mail,
  Send,
  CheckCircle,
  ArrowRight,
  UtensilsCrossed,
  Sparkles,
  KeyRound
} from 'lucide-react';

export const FIXED_TEST_OTP = "123456";

const EmailVerification = ({ data, updateData, onNext, isTestMode }) => {
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

  const handleGenerateTestEmail = () => {
    // Generate random unique email
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const testEmail = `student.${randomSuffix}@pu.ac.in`;
    setEmail(testEmail);
    setOtp(FIXED_TEST_OTP);
    setIsEmailSent(true);
    setTimer(60);
    updateData({ email: testEmail, otp: FIXED_TEST_OTP, isTestMode: true });
    setSuccessMessage(`Test email generated! Fixed OTP: ${FIXED_TEST_OTP}`);
    setErrors({});
  };

  const handleFillTestOtp = () => {
    setOtp(FIXED_TEST_OTP);
    setErrors({});
  };

  const sendVerificationCode = async () => {
    setErrors({});
    if (!email) return setErrors({ email: 'Email is required' });
    if (!validateEmail(email)) return setErrors({ email: 'Please enter a valid email address' });

    setIsSending(true);

    // If test mode is active, simulate without hitting backend
    if (isTestMode || data?.isTestMode) {
      setTimeout(() => {
        setIsSending(false);
        setIsEmailSent(true);
        setOtp(FIXED_TEST_OTP);
        setTimer(60);
        updateData({ email, otp: FIXED_TEST_OTP, isTestMode: true });
        setSuccessMessage(`Verification code sent! (Test fixed OTP: ${FIXED_TEST_OTP})`);
      }, 400);
      return;
    }

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

    // Test mode or test fixed OTP verification (pure frontend)
    if (isTestMode || data?.isTestMode || otp === FIXED_TEST_OTP) {
      setTimeout(() => {
        setIsVerifying(false);
        updateData({ otp, email, isTestMode: true });
        onNext();
      }, 500);
      return;
    }

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
    <div
      ref={sectionRef}
      className="
        w-full 
        max-w-[90%] sm:max-w-lg md:max-w-xl lg:max-w-2xl 
        mx-auto 
        px-4 sm:px-6 md:px-10 
        py-8 sm:py-10 
        flex flex-col 
        justify-center
      "
    >
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-center text-sm font-semibold">
          {successMessage}
        </div>
      )}

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
                className={`w-full px-4 sm:px-5 py-3 sm:py-4 border-2 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 text-base sm:text-lg md:text-xl bg-white ${
                  errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-orange-300'
                }`}
                placeholder="student@university.edu"
              />
              <UtensilsCrossed className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
            className="
              w-full 
              bg-gradient-to-r from-orange-500 to-amber-500 
              text-white 
              py-3 sm:py-4 md:py-5 
              px-4 sm:px-6 
              rounded-xl 
              hover:from-orange-600 hover:to-amber-600 
              transition-all duration-300 
              font-semibold 
              text-base sm:text-lg md:text-xl 
              flex items-center justify-center gap-3 
              shadow-md hover:shadow-lg 
              transform hover:scale-105 
              disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
              cursor-pointer
            "
          >
            {isSending ? (
              <>
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 sm:w-6 sm:h-6" />
                Send Verification Code
              </>
            )}
          </button>

          {/* Test Signup Helper Button */}
          <div className="pt-2 border-t border-orange-200">
            <button
              type="button"
              onClick={handleGenerateTestEmail}
              className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-orange-400 bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>Use Test Signup (Random Email & Fixed OTP)</span>
            </button>
            <p className="text-xs text-gray-500 text-center mt-1.5">
              Generates a unique random student email and fixed OTP 123456 (Frontend preview only)
            </p>
          </div>

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
            <div className="flex justify-between items-center mb-3">
              <label htmlFor="code" className="block text-sm font-semibold text-gray-700">
                Enter 6-Digit Verification Code
              </label>
              <button
                type="button"
                onClick={handleFillTestOtp}
                className="text-xs font-semibold text-orange-600 hover:text-orange-800 flex items-center gap-1 cursor-pointer bg-orange-100 px-2.5 py-1 rounded-lg"
              >
                <KeyRound className="w-3 h-3" />
                Fill Test OTP (123456)
              </button>
            </div>
            <input
              type="text"
              id="code"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              className={`w-full px-4 sm:px-5 py-3 sm:py-4 border-2 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 text-center text-xl sm:text-2xl font-mono tracking-widest bg-white ${
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
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 sm:py-4 px-6 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 font-semibold text-base sm:text-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none cursor-pointer"
          >
            {isVerifying ? (
              <>
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Verify & Continue
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </>
            )}
          </button>

          <div className="text-center">
            {timer > 0 ? (
              <p className="text-sm sm:text-base text-gray-600 bg-gray-50 rounded-lg py-2 px-4">
                🕐 Resend code in <span className="font-semibold text-orange-600">{timer}</span> seconds
              </p>
            ) : (
              <button
                onClick={resendCode}
                className="text-sm sm:text-base text-orange-600 hover:text-orange-700 transition-colors font-semibold bg-orange-50 hover:bg-orange-100 rounded-lg py-2 px-4 cursor-pointer"
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

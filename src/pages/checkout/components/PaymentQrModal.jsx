import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import Modal from "../../../components/ui/Modal";

import { QRCodeCanvas } from "qrcode.react";

// Convert backend date format: DD-MM-YYYY hh:mm:ss AM/PM.
function parseExpiresAt(value) {
  if (!value) return null;

  const match = value.match(
    /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2}):(\d{2})\s+(AM|PM)$/i,
  );

  if (!match) return null;

  const [, day, month, year, hourValue, minute, second, period] = match;

  let hour = Number(hourValue);

  // Convert 12-hour time to 24-hour time.
  if (period.toUpperCase() === "PM" && hour !== 12) {
    hour += 12;
  }

  if (period.toUpperCase() === "AM" && hour === 12) {
    hour = 0;
  }

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    hour,
    Number(minute),
    Number(second),
  );
}

// Format seconds as MM:SS.
function formatCountdown(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

export default function PaymentQrModal({
  isOpen,
  onClose,
  payment,
}) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Start countdown from the PayWay expiration time.
  useEffect(() => {
    if (!isOpen || !payment?.expires_at) {
      return;
    }

    const expiresAt = parseExpiresAt(payment.expires_at);

    if (!expiresAt) {
      return;
    }

    const updateCountdown = () => {
      const difference = Math.max(
        0,
        Math.floor((expiresAt.getTime() - Date.now()) / 1000),
      );

      setSecondsLeft(difference);

      // Close the QR modal when payment time expires.
      if (difference === 0) {
        onClose();
      }
    };

    // Update immediately when modal opens.
    updateCountdown();

    // Update countdown every second.
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [isOpen, payment?.expires_at, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showHeaderBorder={false}
      title="ABA Pay KHQR"
      size="md"
    >
      <div className="grid gap-6 lg:grid-cols-1">
        {/* QR payment section */}
        <div className="rounded-2xl p-5 text-center">

          {/* Show official PayWay QR image first. */}
          <div className="bg-white">
            {payment?.qr_image ? (
              <img
                src={payment.qr_image}
                alt="ABA KHQR"
                className="mx-auto w-full max-w-[220px] object-contain"
              />
            ) : payment?.qr_string ? (
              <QRCodeCanvas
                value={payment.qr_string}
                size={220}
                level="M"
                includeMargin
              />
            ) : (
              <p className="py-20 text-sm text-[#64748B]">
                QR code is unavailable.
              </p>
            )}
          </div>

          {/* QR expiration countdown */}
          <div className="mx-auto mt-5 flex w-fit items-center gap-3 rounded-xl bg-[#FFF4EC] px-5 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#E96400]">
              <Clock3 size={18} />
            </span>

            <div className="text-left">
              <p className="text-[11px] font-medium text-[#64748B]">
                QR expires in
              </p>

              <p className="text-lg font-bold text-[#E96400]">
                {formatCountdown(secondsLeft)}
              </p>
            </div>
          </div>

          {/* Payment instruction */}
          <p className="mt-4 text-xs font-medium text-[#3e3f42]">
            Scan with your banking app to pay securely.
          </p>
        </div>
      </div>
    </Modal>
  );
}
import { useCallback, useEffect, useRef, useState } from "react";
import checkoutService from "../../../services/checkoutService";
import { createPaymentResumeSession } from "../../../services/paymentResumeSession";
import PaymentQrModal from "../../checkout/components/PaymentQrModal";

export default function ResumeOrderPayment({ orderId, onClose, onPaid, onMessage }) {
  const [payment, setPayment] = useState(null);
  const sessionRef = useRef(null);

  useEffect(() => {
    const session = createPaymentResumeSession({
      resume: checkoutService.resumePayment,
      check: async (id, signal) => (await checkoutService.checkPayment(id, signal)).data,
      onReady: setPayment,
      onPaid,
      onMessage: (message, terminal) => {
        onMessage(message);
        if (terminal) onClose();
      },
    });
    sessionRef.current = session;
    session.start(orderId);
    return () => session.stop();
  }, [orderId, onClose, onPaid, onMessage]);

  const close = useCallback(() => {
    sessionRef.current?.stop();
    onClose();
  }, [onClose]);

  return <PaymentQrModal isOpen={Boolean(payment)} payment={payment} onClose={close} />;
}

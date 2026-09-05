@@
         const result = await db.query(
           `UPDATE invoices
            SET payment_status = 'PAID', paid_at = COALESCE(paid_at, NOW())
-           WHERE square_order_id = $1 AND payment_status <> 'PAID'
-           RETURNING application_id, amount_cents`,
+           WHERE square_order_id = $1 AND payment_status <> 'PAID'
+           RETURNING application_id, amount_cents, id`,
           [orderId]
         );
@@
           if (clientResult.rows[0]) notifyInfo = { ...clientResult.rows[0], applicationId, amountCents: result.rows[0].amount_cents };
         }
         await db.query('COMMIT');
         if (notifyInfo) {
           await notifyStatusChange({
             email: notifyInfo.email,
             phone: notifyInfo.phone,
             firstName: notifyInfo.first_name,
             applicationId: notifyInfo.applicationId,
             status: 'CAA_REVIEW',
           }).catch((err) => console.error('Client payment notification failed:', err));
+          // Send a payment receipt to the client and notify staff with details
+          try {
+            const invoiceRow = result.rows[0];
+            const paidAmount = invoiceRow ? invoiceRow.amount_cents : undefined;
+            const invoiceId = invoiceRow ? invoiceRow.id : undefined;
+            await notifyPaymentReceipt({
+              email: notifyInfo.email,
+              firstName: notifyInfo.first_name,
+              applicationId: notifyInfo.applicationId,
+              amountCents: paidAmount,
+              paymentId: payment.id,
+              orderId,
+              invoiceId,
+            }).catch((err) => console.error('Payment receipt notification failed:', err));
+          } catch (err) {
+            console.error('Failed to send payment receipt:', err);
+          }
           notifyStaff({
             event: 'payment_completed',
             applicationId: notifyInfo.applicationId,

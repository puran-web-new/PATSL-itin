@@
   await db.query('COMMIT');
 
-      const emailSent = await sendEmail(
-        client.email,
-        'Your PATSL payment link',
-        `\u0003p\u0003Hi ${client.first_name},\u0003c/p\u0003\u0003p\u0003Please use the secure link below to pay your PATSL service fee of \u0003strong\u0003$${(amountCents / 100).toFixed(2)}\u0003/strong\u0003.\u0003/p\u0003\u0003p\u0003\u0003ca href="${payload.payment_link.url}"\u0003ePay securely\u0003/a\u0003\u0003/p\u0003\u0003p\u0003Application reference: \u0003strong\u0003${applicationReference(applicationId)}\u0003/strong\u0003\u0003/p\u0003\u0003p\u0003— PATSL\u0003/p\u0003`
-      );
-      return NextResponse.json({ checkoutUrl: payload.payment_link.url, emailSent, amountCents });
+      const invoiceId = invoice.rows[0].id;
+      const emailSent = await sendEmail(
+        client.email,
+        'Your PATSL payment link',
+        `<p>Hi ${client.first_name},</p><p>Please use the secure link below to pay your PATSL service fee of <strong>$${(amountCents / 100).toFixed(2)}</strong>.</p><p><a href="${payload.payment_link.url}">Pay securely</a></p><p>Application reference: <strong>${applicationReference(applicationId)}</strong></p><p>Invoice: <strong>#${invoiceId}</strong></p><p>— PATSL</p>`
+      );
+      return NextResponse.json({ checkoutUrl: payload.payment_link.url, emailSent, amountCents, invoiceId });
     } catch (error) {
       await db.query('ROLLBACK');
       throw error;
     } finally {
       db.release();
     }

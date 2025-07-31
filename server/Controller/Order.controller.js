const pool = require("../Database/db");
const crypto = require("crypto");
const {
  CreateOrderRazorpay,
  PaymentVerification,
} = require("../service/razarpay.service");
const cloudinary = require("cloudinary").v2;

const sendEmail = require("../utils/sendEmail");

const sendMessage = require("../utils/Send_Whatsapp");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.GetMyOrder = async (req, res) => {
  try {
    const user = req.user?.id?.customer_id;
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const sqlQuery = `SELECT * FROM cp_order WHERE customer_id = ?`;
    const [orders] = await pool.execute(sqlQuery, [user]);

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    orders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));

    // Pagination
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedOrders = orders.slice(startIndex, endIndex);

    // Extract order IDs from paginated orders
    const orderIds = paginatedOrders.map((order) => order.order_id);

    // If no order IDs, skip fetching details
    if (orderIds.length === 0) {
      return res.status(200).json({
        message: "Orders fetched successfully",
        data: [],
        totalPages: Math.ceil(orders.length / limit),
      });
    }

    // Fetch order details for the paginated orders
    const orderDetailsSql = `SELECT * FROM cp_app_order_details WHERE order_id IN (${orderIds
      .map(() => "?")
      .join(",")})`;
    const [orderDetails] = await pool.execute(orderDetailsSql, orderIds);

    // Map order details by order ID
    const orderDetailsMap = orderDetails.reduce((map, detail) => {
      map[detail.order_id] = map[detail.order_id] || [];
      map[detail.order_id].push(detail);
      return map;
    }, {});

    // Combine orders with their details
    const updatedOrders = paginatedOrders.map((order) => {
      order.details = orderDetailsMap[order.order_id] || [];
      return order;
    });

    res.status(200).json({
      message: "Orders fetched successfully",
      data: updatedOrders,
      totalPages: Math.ceil(orders.length / limit),
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.UploadPrescription = (req, res) => {
  try {
    const { customer_id } = req.body;
    const file = req.file;

    console.log("Received File:", file);

    if (!file) {
      return res.status(400).json({ message: "File is required" });
    }

    const NameOfPrescription = crypto.randomBytes(6).toString("hex");
    let data;
    // Upload to Cloudinary using upload_stream
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: `prescriptions/${NameOfPrescription}`,
        folder: "prescriptions",
      },
      async (err, result) => {
        if (err) {
          console.error("Cloudinary Upload Error:", err);
          return res.status(500).json({
            message: "Error while uploading the prescription",
            error: err,
          });
        }

        const fileUrl = result.secure_url;
        const filePublicId = result.public_id;

        console.log("Uploaded File URL & Public ID:", fileUrl, filePublicId);

        // Insert into the database
        const sqlQuery = `
                    INSERT INTO cp_prescription (customer_id, prescription_name, prescription_file, type)
                    VALUES (?, ?, ?, ?)
                `;
        const values = [customer_id, NameOfPrescription, fileUrl, "App"];

        const dataC = await pool.query(
          sqlQuery,
          values,
          async (err, dbResult) => {
            if (err) {
              await cloudinary.uploader.destroy(filePublicId);
              console.error("Database Error:", err);

              return res.status(500).json({
                message: "Error while saving the prescription",
                error: err,
              });
            }
          }
        );
        return res.status(200).json({
          message: "Prescription uploaded successfully",
          result: JSON.stringify(dataC[0]?.insertId),
        });
      }
    );

    // Pipe the file buffer to Cloudinary
    stream.end(file.buffer);
  } catch (error) {
    console.error("Unexpected Error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

exports.CreateOrder = async (req, res) => {
  try {
    // Validate user authentication
    const userId = req.user?.id?.customer_id;
    if (!userId) {
      return res.status(401).json({
        message:
          "Authentication required. Please log in to complete the order.",
      });
    }

    // Extract request data
    const {
      Rx_id,
      address,
      patientName,
      patientPhone,
      hospitalName,
      doctorName,
      parseDataCome,
      prescriptionNotes,
      paymentOption,
      cart,
      payment_mode = "Razorpay",
    } = req.body;

    // Validate required fields
    if (!cart?.items || cart?.items?.length === 0) {
      return res.status(400).json({ message: "Product details are required." });
    }

    if (!address || !address.stree_address || !address.pincode) {
      return res.status(400).json({ message: "Delivery address is required." });
    }

    if (!patientName || !patientPhone) {
      return res.status(400).json({ message: "Patient details are required." });
    }

    // Check if user exists in the database
    const checkUserSql = `SELECT * FROM cp_customer WHERE customer_id = ?`;
    const [userExists] = await pool
      .execute(checkUserSql, [userId])
      .catch((err) => {
        console.error("Database error when checking user:", err);
        throw new Error("Failed to verify user information.");
      });

    if (!userExists || userExists.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    // Verify prescription if provided
    let newRxId = null;
    if (Rx_id) {
      const prescriptionQuery = `SELECT * FROM cp_app_prescription WHERE genreate_presc_order_id = ?`;
      const [prescription] = await pool
        .execute(prescriptionQuery, [Rx_id])
        .catch((err) => {
          console.error("Database error when checking prescription:", err);
          throw new Error("Failed to verify prescription information.");
        });

      if (prescription.length === 0) {
        return res.status(404).json({ message: "Prescription not found." });
      }

      newRxId = prescription[0]?.id;
    }

    // Get system settings
    const settingsQuery = `SELECT * FROM cp_settings`;
    const [settings] = await pool.execute(settingsQuery).catch((err) => {
      console.error("Database error when fetching settings:", err);
      throw new Error("Failed to retrieve system settings.");
    });

    if (!settings || settings.length === 0) {
      return res
        .status(500)
        .json({ message: "System settings not available." });
    }

    const setting = settings[0];

    // Calculate shipping and additional charges
    const shippingCharge =
      cart?.totalPrice > setting?.shipping_threshold
        ? 0
        : Number(setting?.shipping_charge);
    const extraCharges = paymentOption === "COD" ? Number(setting?.cod_fee) : 0;

    // Create timestamp for order tracking
    const orderDate = new Date();
    const formattedDate = orderDate
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Prepare order object
    const Order = {
      order_date: formattedDate,
      orderFrom: "Application",
      customer_id: userExists[0]?.customer_id,
      prescription_id: newRxId || "",
      hospital_name: hospitalName || "",
      doctor_name: doctorName || "",
      prescription_notes: prescriptionNotes || "",
      customer_name: patientName,
      patient_name: patientName,
      customer_email: userExists[0]?.email_id,
      customer_phone: patientPhone,
      customer_address: `${address?.house_no}, ${address?.stree_address}`,
      customer_pincode: address?.pincode,
      customer_shipping_name: patientName,
      customer_shipping_phone: patientPhone,
      customer_shipping_address: `${address?.house_no}, ${address?.stree_address}`,
      customer_shipping_pincode: address?.pincode,
      amount: cart?.totalPrice,
      subtotal: cart?.totalPrice,
      order_gst: cart?.totalTax || "",
      coupon_code: cart?.couponCode || "",
      coupon_discount: cart?.discount || 0,
      shipping_charge: shippingCharge,
      additional_charge: extraCharges,
      payment_mode: paymentOption === "Online" ? payment_mode : "COD",
      payment_option: paymentOption === "Online" ? "Online" : "COD",
      status:
        newRxId && paymentOption
          ? paymentOption === "Online"
            ? "Pending"
            : "New"
          : "Prescription Pending",
    };

    // Prepare product details
    const ProductInOrder = cart?.items.map((item) => ({
      product_id: item?.ProductId,
      product_name: item?.title,
      product_image: item?.image,
      unit_price: item?.Pricing,
      unit_quantity: item?.quantity,
      tax_percent: item?.taxPercent || 0,
      tax_amount: item?.taxAmount || 0,
    }));

    // SQL queries
    const sqlOrderDetails = `
        INSERT INTO cp_app_order_details 
        (order_id, product_id, product_name, product_image, unit_price, unit_quantity, tax_percent, tax_amount) 
        VALUES (?,?,?,?,?,?,?,?)`;

    const insertOrderDetailQuery = `
        INSERT INTO cp_order_details 
        (order_id, product_id, product_name, product_image, unit_price, unit_quantity, tax_percent, tax_amount, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;

    const saveOrderSql = `
       INSERT INTO cp_order (
           order_date, orderFrom, customer_id, prescription_id, hospital_name, doctor_name, prescription_notes,
           customer_name, patient_name, customer_email, customer_phone, customer_address, customer_pincode,
           customer_shipping_name, customer_shipping_phone, customer_shipping_address, customer_shipping_pincode,
           amount, subtotal, order_gst, coupon_code, coupon_discount, shipping_charge, additional_charge,
           payment_mode, payment_option, status
       ) VALUES (
           ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
       )`;

    const saveOrderInTemp = `
       INSERT INTO cp_order_temp (
           order_date, razorpayOrderID, orderFrom, customer_id, prescription_id, hospital_name, doctor_name, prescription_notes,
           customer_name, patient_name, customer_email, customer_phone, customer_address, customer_pincode,
           customer_shipping_name, customer_shipping_phone, customer_shipping_address, customer_shipping_pincode,
           amount, subtotal, order_gst, coupon_code, coupon_discount, shipping_charge, additional_charge,
           payment_mode, payment_option, status
       ) VALUES (
           ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
       )`;

    // Process order based on payment option
    if (paymentOption === "Online") {
      // Handle online payment with Razorpay
      try {
        const razorpay = new CreateOrderRazorpay();
        const amount = Order?.amount;
        const sendOrder = await razorpay.createOrder(amount);

        // Prepare temporary order for Razorpay
        const TempOrder = {
          order_date: formattedDate,
          razorpayOrderID: sendOrder.id,
          orderFrom: "Application",
          customer_id: userExists[0]?.customer_id,
          prescription_id: newRxId || "",
          hospital_name: hospitalName || "",
          doctor_name: doctorName || "",
          prescription_notes: prescriptionNotes || "",
          customer_name: patientName,
          patient_name: patientName,
          customer_email: userExists[0]?.email_id,
          customer_phone: patientPhone,
          customer_address: `${address?.house_no}, ${address?.stree_address}`,
          customer_pincode: address?.pincode,
          customer_shipping_name: patientName,
          customer_shipping_phone: patientPhone,
          customer_shipping_address: `${address?.house_no}, ${address?.stree_address}`,
          customer_shipping_pincode: address?.pincode,
          amount: Order.amount,
          subtotal: cart?.totalPrice,
          order_gst: cart?.totalTax || "",
          coupon_code: cart?.couponCode || "",
          coupon_discount: cart?.discount || 0,
          shipping_charge: shippingCharge,
          additional_charge: 0,
          payment_mode: payment_mode,
          payment_option: paymentOption || "Online",
          status: "Pending",
        };

        const orderValuesTemp = Object.values(TempOrder);

        // Save temporary order
        const [saveOrder] = await pool
          .execute(saveOrderInTemp, orderValuesTemp)
          .catch((err) => {
            console.error("Database error when saving temporary order:", err);
            throw new Error("Failed to create temporary order.");
          });

        // Save order details
        for (const item of ProductInOrder) {
          const orderDetailsValues = [
            saveOrder.insertId,
            item.product_id,
            item.product_name,
            item.product_image,
            item.unit_price,
            item.unit_quantity,
            item.tax_percent,
            item.tax_amount,
          ];

          await pool
            .execute(sqlOrderDetails, orderDetailsValues)
            .catch((err) => {
              console.error(
                `Database error when saving product ${item.product_name}:`,
                err
              );
              // Continue with other products even if one fails
            });
        }
        console.log("Order from  Online TempOrder", TempOrder);
        // Send admin notification for pending online payment
        await sendAdminOrderNotification({
          order: TempOrder,
          products: ProductInOrder,
          customer: userExists[0],
          isTemp: true,
          orderId: saveOrder.insertId,
          razorpayOrderId: sendOrder.id,
        });

        return res.status(201).json({
          message: "Order created successfully. Please complete payment.",
          sendOrder,
        });
      } catch (error) {
        console.error("Error processing online payment:", error);
        return res.status(500).json({
          message: "Failed to process payment request.",
          error: error.message,
        });
      }
    } else {
      // Handle COD order
      try {
        console.log("=== COD ORDER PROCESSING STARTED ===");
        console.log("Order Details:", Order);
        console.log("Products in Order:", ProductInOrder);

        const orderValues = Object.values(Order);

        // Save order
        const [orderPlaced] = await pool
          .execute(saveOrderSql, orderValues)
          .catch((err) => {
            console.error("Database error when saving order:", err);
            throw new Error("Failed to create order.");
          });

        if (!orderPlaced?.insertId) {
          throw new Error("Failed to retrieve order ID after saving order.");
        }

        const newOrderId = orderPlaced.insertId;
        const transactionNumber = `PH-${newOrderId}`;

        console.log(`COD Order created with ID: ${newOrderId}`);
        console.log(`Transaction Number: ${transactionNumber}`);

        // Update order with generated ID and transaction number
        const updateOrderQuery = `
          UPDATE cp_order
          SET databaseOrderID = ?, transaction_number = ?
          WHERE order_id = ?
        `;

        await pool
          .execute(updateOrderQuery, [
            newOrderId,
            transactionNumber,
            newOrderId,
          ])
          .catch((err) => {
            console.error(
              "Database error when updating order with transaction number:",
              err
            );
            // Continue even if this update fails
          });

        console.log("Order updated with transaction number successfully");

        // Process each product in the order
        let items = [];
        let totalAmount = 0;

        console.log("=== SAVING PRODUCTS TO BOTH TABLES ===");

        for (const [index, item] of ProductInOrder.entries()) {
          console.log(`Processing product ${index + 1}:`, item.product_name);

          const orderDetailsValues = [
            newOrderId,
            item.product_id,
            item.product_name,
            item.product_image,
            item.unit_price,
            item.unit_quantity,
            item.tax_percent,
            item.tax_amount,
          ];

          try {
            // Insert into cp_app_order_details
            await pool.execute(sqlOrderDetails, orderDetailsValues);
            console.log(`✓ Product ${item.product_name} saved to cp_app_order_details`);

            // Insert into cp_order_details (ONLY FOR COD)
            await pool.execute(insertOrderDetailQuery, orderDetailsValues);
            console.log(`✓ Product ${item.product_name} saved to cp_order_details`);

          } catch (productError) {
            console.error(
              `❌ Error inserting product ${item.product_name}:`,
              productError
            );
            // Continue with other products even if one fails
          }

          // Add formatted item to the message
          items.push({
            name: item.product_name,
            price: item.unit_price,
            quantity: item.unit_quantity,
            tax: item.tax_amount,
            total: item.unit_price * item.unit_quantity + item.tax_amount,
          });

          // Add to total amount
          totalAmount += item.unit_price * item.unit_quantity + item.tax_amount;
        }

        console.log(`=== PRODUCT INSERTION COMPLETED ===`);
        console.log(`Total products processed: ${ProductInOrder.length}`);
        console.log(`Total amount calculated: ${totalAmount}`);

        // Compose WhatsApp order confirmation message
        const message = generateOrderConfirmationMessage({
          orderNumber: transactionNumber,
          customerName: patientName,
          items: ProductInOrder,
          subtotal: cart?.totalPrice,
          shipping: shippingCharge,
          extraCharges,
          total: Order.amount,
          paymentMethod: "Cash on Delivery",
        });

        // Send WhatsApp message to customer
        const userMobile = userExists[0]?.mobile || patientPhone;
        if (userMobile) {
          try {
            await sendMessage({
              mobile: userMobile,
              msg: message,
            });
            console.log(`WhatsApp message sent to: ${userMobile}`);
          } catch (messageError) {
            console.error(
              "Failed to send WhatsApp notification:",
              messageError
            );
            // Continue even if message fails
          }
        }

        console.log("Order from COD order", Order);

        // Send email notification to admin
        await sendAdminOrderNotification({
          order: {
            ...Order,
            order_id: newOrderId,
            transaction_number: transactionNumber,
          },
          products: ProductInOrder,
          customer: userExists[0],
          isTemp: false,
          orderId: newOrderId,
        });

        console.log("Admin notification sent successfully");
        console.log("=== COD ORDER PROCESSING COMPLETED ===");

        // Respond to client
        return res.status(201).json({
          message: "Order created successfully.",
          orderId: newOrderId,
          transactionNumber,
        });
      } catch (error) {
        console.error("Error creating COD order:", error);
        return res.status(500).json({
          message: "An error occurred while creating the order.",
          error: error.message,
        });
      }
    }
  } catch (error) {
    console.error("Error in CreateOrder:", error);
    return res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
      error: error.message,
    });
  }
};
function generateOrderConfirmationMessage(params) {
  const {
    orderNumber,
    customerName,
    items,
    subtotal,
    shipping,
    extraCharges,
    total,
    paymentMethod,
  } = params;

  // Format items list
  const itemsList = items
    .map(
      (item) =>
        `• *${item.product_name}*\n  ₹${item.unit_price} × ${item.unit_quantity
        } = ₹${(item.unit_price * item.unit_quantity).toFixed(2)}`
    )
    .join("\n");

  // Build full message
  return `🎉 *Order Confirmed!* 🎉

Dear *${customerName}*,

Thank you for shopping with *Onco Healthmart*! Your order has been successfully placed.

*Order #:* ${orderNumber}
*Date:* ${new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}

*Your Order:*
${itemsList}

*Order Summary:*
Subtotal: ₹${((subtotal || 0) - (shipping || 0) - (extraCharges || 0)).toFixed(
    2
  )}
Shipping: ₹${shipping.toFixed(2)}
${extraCharges > 0 ? `COD Fee: ₹${extraCharges.toFixed(2)}\n` : ""}
*Total Amount:* ₹${total.toFixed(2)}

*Payment Method:* ${paymentMethod}
*Status:* Confirming

Our team will process your order shortly. We'll share tracking details once your order ships.

For any questions regarding your order, please contact our customer support at:
📞 +91-9212292778
📧 oncohealthmart@gmail.com

Thank you for trusting Onco Healthmart for your healthcare needs. We value your health and well-being.

Stay healthy! ❤️`;
}

async function sendAdminOrderNotification(params) {
  const {
    order,
    products,
    customer,
    isTemp,
    orderId,
    razorpayOrderId = null,
  } = params;

  try {
    // Calculate totals
    const subtotal = products.reduce(
      (sum, item) => sum + item.unit_price * item.unit_quantity,
      0
    );
    const taxTotal = products.reduce(
      (sum, item) => sum + (item.tax_amount || 0),
      0
    );

    // Get admin email from settings
    // const settingsQuery = `SELECT admin_email FROM cp_settings LIMIT 1`;
    // const [settings] = await pool.execute(settingsQuery);
    const adminEmail = "oncohealthmart@gmail.com";

    // Format products for email
    const formattedProducts = products
      .map((product, index) => {
        const totalPrice = product.unit_price * product.unit_quantity;
        return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${index + 1
          }</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${product.product_name
          }</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">₹${product.unit_price.toFixed(
            2
          )}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${product.unit_quantity
          }</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">₹${totalPrice.toFixed(
            2
          )}</td>
<td style="padding: 10px; border-bottom: 1px solid #ddd;">
  ₹${typeof product.tax_amount === 'number' ? product.tax_amount : ''}
</td>
<td style="padding: 10px; border-bottom: 1px solid #ddd;">
  ₹${typeof product.tax_amount === 'number' && typeof totalPrice === 'number'
            ? totalPrice + product.tax_amount
            : ''
          }
</td>

        </tr>
      `;
      })
      .join("");

    // Build email HTML
    const emailSubject = isTemp
      ? `New Pending Online Order #${orderId} (Razorpay: ${razorpayOrderId})`
      : `New COD Order #${orderId} (${order.transaction_number})`;

    const orderStatus = isTemp ? "Pending Payment" : "New";
    const paymentMethod = isTemp
      ? "Online Payment (Razorpay)"
      : "Cash on Delivery";

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>New Order Notification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { width: 100%; max-width: 650px; margin: 0 auto; }
        .header { background-color: #4A90E2; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .order-info { margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 4px; }
        .customer-info { margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 4px; }
        .products { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .products th { background-color: #4A90E2; color: white; text-align: left; padding: 10px; }
        .summary { margin-top: 20px; margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 4px; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #777; }
        .status { display: inline-block; padding: 5px 10px; border-radius: 4px; font-weight: bold; background-color: #FFC107; color: #333; }
        .note { margin-top: 20px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Order Notification</h1>
        </div>
        <div class="content">
          <div class="order-info">
            <h2>Order Details</h2>
            <p><strong>Order ID:</strong> ${orderId}</p>
            ${isTemp
        ? `<p><strong>Razorpay Order ID:</strong> ${razorpayOrderId}</p>`
        : `<p><strong>Transaction Number:</strong> ${order.transaction_number}</p>`
      }
            <p><strong>Order Date:</strong> ${new Date(
        order.order_date
      ).toLocaleString("en-IN")}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p><strong>Status:</strong> <span class="status">${orderStatus}</span></p>
            ${order.prescription_id
        ? `<p><strong>Prescription ID:</strong> ${order.prescription_id}</p>`
        : ""
      }
            ${order.hospital_name
        ? `<p><strong>Hospital:</strong> ${order.hospital_name}</p>`
        : ""
      }
            ${order.doctor_name
        ? `<p><strong>Doctor:</strong> ${order.doctor_name}</p>`
        : ""
      }
          </div>
          
          <div class="customer-info">
            <h2>Customer Information</h2>
            <p><strong>Name:</strong> ${order.customer_name}</p>
            <p><strong>Email:</strong> ${order.customer_email}</p>
            <p><strong>Phone:</strong> ${order.customer_phone}</p>
            
            <h3>Billing Address</h3>
            <p>${order.customer_address}</p>
            <p>Pincode: ${order.customer_pincode}</p>
            
            <h3>Shipping Address</h3>
            <p>${order.customer_shipping_address}</p>
            <p>Pincode: ${order.customer_shipping_pincode}</p>
          </div>
          
          <h2>Order Items</h2>
          <table class="products">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Subtotal</th>
                <th>Tax</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${formattedProducts}
            </tbody>
          </table>
          
          <div class="summary">
            <h2>Order Summary</h2>
            <p><strong>Subtotal:</strong> ₹${subtotal.toFixed(2)}</p>
 <p><strong>Tax:</strong> ₹${typeof taxTotal === 'number' ? taxTotal : ''}</p>

            <p><strong>Shipping:</strong> ₹${order.shipping_charge.toFixed(
        2
      )}</p>
        ${typeof order.additional_charge === 'number' && order.additional_charge > 0
        ? `<p><strong>COD Fee:</strong> ₹${order.additional_charge}</p>`
        : ""
      }

${typeof order.coupon_discount === 'number' && order.coupon_discount > 0
        ? `<p><strong>Discount:</strong> ₹${order.coupon_discount}</p>`
        : ""
      }

<p style="font-size: 18px;">
  <strong>Total:</strong> ₹${typeof order.amount === 'number' ? order.amount : ""}
</p>

          </div>
          
          ${order.prescription_notes
        ? `
          <div class="note">
            <h3>Prescription Notes:</h3>
            <p>${order.prescription_notes}</p>
          </div>
          `
        : ""
      }
          
          <div class="note">
            <p>This is an automated notification. Please take appropriate action on this order.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Onco Healthmart. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    try {
      await sendEmail({
        to: adminEmail,
        subject: emailSubject,
        html: emailHtml,
      });
      console.log("Admin notification email sent successfully.");
      return;
    } catch (emailError) {
      console.error("Error sending admin notification email:", emailError);
      // Do not throw the error to avoid interrupting the order process
    }
  } catch (error) {
    console.error("Failed to send admin notification email:", error);
    // Don't throw error to prevent order process from failing
  }
}

exports.VerifyPaymentOrder = async (req, res) => {
  let tempOrder = null;
  let tempOrderDetails = [];
  let newOrderId = null;
  let errorContext = "";

  try {
    console.log("=== PAYMENT VERIFICATION STARTED ===");
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    // Validation
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      console.log("❌ Missing payment details:", {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      });
      return res.status(400).json({
        success: false,
        message: "Missing required payment details. Please try again or contact support.",
      });
    }

    console.log("✅ Payment details received:", {
      razorpay_payment_id,
      razorpay_order_id,
    });

    errorContext = "Fetching temporary order";

    // Get temporary order details first
    const findOrderQuery = `
      SELECT * FROM cp_order_temp 
      WHERE razorpayOrderID = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    const [order] = await pool.execute(findOrderQuery, [razorpay_order_id]);

    if (order.length === 0) {
      console.log("❌ Temporary order not found for razorpayOrderID:", razorpay_order_id);
      await sendAdminAlert("Order Not Found", `Temporary order not found for Razorpay Order ID: ${razorpay_order_id}`, {
        razorpay_payment_id,
        razorpay_order_id,
        error: "Temporary order not found"
      });

      return res.status(404).json({
        success: false,
        message: "Order not found. Please contact support with your payment details.",
      });
    }

    tempOrder = order[0];
    errorContext = "Fetching temporary order details";

    // Get order details from temporary order
    const getTempOrderDetailsQuery = `SELECT * FROM cp_app_order_details WHERE order_id = ?`;
    const [orderDetails] = await pool.execute(getTempOrderDetailsQuery, [tempOrder.order_id]);
    tempOrderDetails = orderDetails;

    console.log("📋 Temporary order found:", {
      temp_order_id: tempOrder.order_id,
      razorpayOrderID: tempOrder.razorpayOrderID,
      customer_name: tempOrder.customer_name,
      order_details_count: tempOrderDetails.length,
    });

    if (tempOrderDetails.length === 0) {
      console.log("❌ No order details found for temporary order");
      await sendAdminAlert("Order Details Not Found", `No order details found for temporary order: ${tempOrder.order_id}`, {
        razorpay_payment_id,
        razorpay_order_id,
        temp_order_id: tempOrder.order_id,
        error: "Order details not found"
      });

      return res.status(404).json({
        success: false,
        message: "Order details not found. Please contact support for assistance.",
      });
    }

    errorContext = "Payment verification with Razorpay";
    const data = { razorpay_payment_id, razorpay_order_id, razorpay_signature };

    // Verify payment with Razorpay
    const verifyPayment = new PaymentVerification();
    const orderCheck = await verifyPayment.verifyPayment(data);
    console.log("💳 Payment verification result:", orderCheck);

    // Always create permanent order record regardless of payment verification status
    errorContext = "Creating permanent order record";

    // Check if order already exists in permanent table
    const checkExistingOrderQuery = `SELECT * FROM cp_order WHERE razorpayOrderID = ?`;
    const [existingOrder] = await pool.execute(checkExistingOrderQuery, [razorpay_order_id]);

    if (existingOrder.length > 0) {
      console.log("⚠️ Order already exists in permanent table:", existingOrder[0].order_id);

      // If payment failed but order exists, update status
      if (!orderCheck) {
        await updateOrderStatus(existingOrder[0].order_id, "Cancelled", "Failed", razorpay_payment_id);
        await sendAdminAlert("Payment Verification Failed - Existing Order",
          `Payment verification failed for existing order: ${existingOrder[0].order_id}`, {
          razorpay_payment_id,
          razorpay_order_id,
          existing_order_id: existingOrder[0].order_id,
          error: "Payment verification failed for existing order"
        });

        return res.status(403).json({
          success: false,
          redirect: "failed_screen",
          message: "Payment verification failed. Your order has been cancelled. Please try again.",
        });
      }

      return res.status(200).json({
        success: true,
        redirect: "success_screen",
        message: "Order already processed successfully.",
        order_id: existingOrder[0].order_id,
      });
    }

    // Determine order status based on payment verification
    const orderStatus = orderCheck ? "New" : "Cancelled";
    const paymentStatus = orderCheck ? "Paid" : "Failed";

    console.log(`📝 Creating permanent order with status: ${orderStatus}, payment: ${paymentStatus}`);

    // Create permanent order (always create, regardless of payment status)
    const copyOrderQuery = `
      INSERT INTO cp_order (
        order_date, razorpayOrderID, customer_id, prescription_id, hospital_name, doctor_name, prescription_notes,
        customer_name, patient_name, customer_email, customer_phone, customer_address, customer_pincode,
        customer_shipping_name, customer_shipping_phone, customer_shipping_address, customer_shipping_pincode,
        amount, subtotal, order_gst, coupon_code, coupon_discount, shipping_charge, additional_charge,
        payment_mode, payment_option, status, payment_status, transaction_number, orderFrom
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const orderValues = [
      tempOrder.order_date,
      tempOrder.razorpayOrderID,
      tempOrder.customer_id,
      tempOrder.prescription_id,
      tempOrder.hospital_name,
      tempOrder.doctor_name,
      tempOrder.prescription_notes,
      tempOrder.customer_name,
      tempOrder.patient_name,
      tempOrder.customer_email,
      tempOrder.customer_phone,
      tempOrder.customer_address,
      tempOrder.customer_pincode,
      tempOrder.customer_shipping_name,
      tempOrder.customer_shipping_phone,
      tempOrder.customer_shipping_address,
      tempOrder.customer_shipping_pincode,
      tempOrder.amount,
      tempOrder.subtotal,
      tempOrder.order_gst,
      tempOrder.coupon_code,
      tempOrder.coupon_discount,
      tempOrder.shipping_charge,
      tempOrder.additional_charge,
      tempOrder.payment_mode,
      tempOrder.payment_option,
      orderStatus,
      paymentStatus,
      razorpay_payment_id,
      "Application"
    ];

    const [insertResult] = await pool.execute(copyOrderQuery, orderValues);
    newOrderId = insertResult.insertId;

    if (!newOrderId) {
      throw new Error("Failed to create permanent order - no insert ID returned");
    }

    console.log("✅ Permanent order created with ID:", newOrderId);

    // Update the permanent order with database order ID
    const updateOrderQuery2 = `
      UPDATE cp_order
      SET databaseOrderID = ?, transaction_number = ?, orderFrom = ?
      WHERE order_id = ?
    `;

    await pool.execute(updateOrderQuery2, [
      newOrderId,
      `PH-${newOrderId}`,
      "Application",
      newOrderId,
    ]);

    console.log("✅ Permanent order updated with transaction number: PH-" + newOrderId);

    // Insert order details (always save details, regardless of payment status)
    errorContext = "Saving order details";
    console.log("🔄 Starting order details migration...");

    for (let i = 0; i < tempOrderDetails.length; i++) {
      const detail = tempOrderDetails[i];

      // Validate and sanitize data
      const sanitizedDetail = {
        product_id: detail.product_id || null,
        product_name: detail.product_name ? String(detail.product_name).substring(0, 255) : null,
        product_image: detail.product_image ? String(detail.product_image).substring(0, 500) : null,
        unit_price: parseFloat(detail.unit_price) || 0,
        unit_quantity: parseInt(detail.unit_quantity) || 0,
        tax_percent: parseFloat(detail.tax_percent) || 0,
        tax_amount: parseFloat(detail.tax_amount) || 0,
      };

      try {
        // Insert into cp_order_details
        const insertOrderDetailQuery = `
          INSERT INTO cp_order_details 
          (order_id, product_id, product_name, product_image, unit_price, unit_quantity, tax_percent, tax_amount, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        const detailValues = [
          newOrderId,
          sanitizedDetail.product_id,
          sanitizedDetail.product_name,
          sanitizedDetail.product_image,
          sanitizedDetail.unit_price,
          sanitizedDetail.unit_quantity,
          sanitizedDetail.tax_percent,
          sanitizedDetail.tax_amount,
        ];

        await pool.execute(insertOrderDetailQuery, detailValues);

        // Also insert into cp_app_order_details
        const insertAppOrderDetailQuery = `
          INSERT INTO cp_app_order_details 
          (order_id, product_id, product_name, product_image, unit_price, unit_quantity, tax_percent, tax_amount, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        await pool.execute(insertAppOrderDetailQuery, detailValues);

        console.log(`✅ Order detail ${i + 1}/${tempOrderDetails.length} saved successfully`);
      } catch (detailError) {
        console.error(`⚠️ Error saving detail ${i + 1}:`, detailError);
        // Continue with other details, don't fail the entire process
      }
    }

    console.log("✅ Order details migration completed");

    // Update temporary order status
    const updateTempOrderQuery = `
      UPDATE cp_order_temp
      SET payment_status = ?, transaction_number = ?, status = ?
      WHERE razorpayOrderID = ?
    `;
    await pool.execute(updateTempOrderQuery, [paymentStatus, razorpay_payment_id, orderStatus, razorpay_order_id]);

    // If payment verification failed, send alert and return error
    if (!orderCheck) {
      console.log("❌ Payment verification failed - order saved with failed status");

      await sendAdminAlert("Payment Verification Failed",
        `Payment verification failed but order data has been preserved`, {
        razorpay_payment_id,
        razorpay_order_id,
        order_id: newOrderId,
        customer_name: tempOrder.customer_name,
        customer_phone: tempOrder.customer_phone,
        amount: tempOrder.amount,
        error: "Payment verification failed with Razorpay"
      });

      return res.status(403).json({
        success: false,
        redirect: "failed_screen",
        message: "Payment verification failed. Your order details have been saved and our team will contact you shortly.",
        order_id: newOrderId,
      });
    }

    // Payment successful - proceed with confirmations
    console.log("✅ Payment verified successfully - processing confirmations");

    errorContext = "Processing successful payment confirmations";

    // Get final order details
    const order_details_after = await find_Details_Order(tempOrder?.razorpayOrderID);

    if (order_details_after) {
      // Generate receipt HTML
      const html_page = generateReceiptHTML(order_details_after);

      // Send confirmations (don't fail if these fail)
      try {
        // WhatsApp confirmation
        const message = generateWhatsAppMessage(order_details_after);
        const dataSend = await sendMessage({
          mobile: order_details_after?.customer_shipping_phone,
          msg: message,
        });
        console.log("✅ WhatsApp message sent", dataSend);
      } catch (whatsappError) {
        console.error("⚠️ WhatsApp sending failed:", whatsappError);
        // Don't fail the entire process
      }

      try {
        // Send confirmation emails
        const mail_options = {
          from: "Onco Health Mart <noreply@oncohealthmart.com>",
          to: "oncohealthmart@gmail.com",
          subject: "Order Confirmation",
          html: html_page,
        };

        const mail_options_for_user = {
          from: "Onco Health Mart <noreply@oncohealthmart.com>",
          to: order_details_after.customer_email || tempOrder?.customer_email,
          subject: "Order Confirmation",
          html: html_page,
        };

        await sendEmail(mail_options);
        await sendEmail(mail_options_for_user);
        console.log("✅ Confirmation emails sent");
      } catch (emailError) {
        console.error("⚠️ Email sending failed:", emailError);
        // Don't fail the entire process
      }
    }

    // Clean up temporary data (optional)
    try {
      const deleteTempOrderDetailsQuery = `DELETE FROM cp_app_order_details WHERE order_id = ?`;
      await pool.execute(deleteTempOrderDetailsQuery, [tempOrder.order_id]);
      console.log("✅ Temporary order details cleaned up");
    } catch (cleanupError) {
      console.error("⚠️ Cleanup failed:", cleanupError);
      // Don't fail the main process
    }

    console.log("=== PAYMENT VERIFICATION COMPLETED SUCCESSFULLY ===");

    return res.status(200).json({
      success: true,
      redirect: "success_screen",
      message: "Payment verified and order processed successfully.",
      order_id: newOrderId,
      transaction_number: `PH-${newOrderId}`,
    });

  } catch (error) {
    console.error("💥 CRITICAL ERROR in payment verification:", error);
    console.error("Error context:", errorContext);
    console.error("Error stack:", error.stack);

    // Try to save order data even if there was an error
    try {
      const { razorpay_payment_id, razorpay_order_id } = req.body;

      // If we have temp order data and haven't created permanent order yet, create it with failed status
      if (tempOrder && !newOrderId) {
        console.log("🔄 Attempting to save order data despite error...");

        const emergencyOrderQuery = `
          INSERT INTO cp_order (
            order_date, razorpayOrderID, customer_id, prescription_id, hospital_name, doctor_name, prescription_notes,
            customer_name, patient_name, customer_email, customer_phone, customer_address, customer_pincode,
            customer_shipping_name, customer_shipping_phone, customer_shipping_address, customer_shipping_pincode,
            amount, subtotal, order_gst, coupon_code, coupon_discount, shipping_charge, additional_charge,
            payment_mode, payment_option, status, payment_status, transaction_number, orderFrom
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const emergencyOrderValues = [
          tempOrder.order_date,
          tempOrder.razorpayOrderID,
          tempOrder.customer_id,
          tempOrder.prescription_id,
          tempOrder.hospital_name,
          tempOrder.doctor_name,
          tempOrder.prescription_notes,
          tempOrder.customer_name,
          tempOrder.patient_name,
          tempOrder.customer_email,
          tempOrder.customer_phone,
          tempOrder.customer_address,
          tempOrder.customer_pincode,
          tempOrder.customer_shipping_name,
          tempOrder.customer_shipping_phone,
          tempOrder.customer_shipping_address,
          tempOrder.customer_shipping_pincode,
          tempOrder.amount,
          tempOrder.subtotal,
          tempOrder.order_gst,
          tempOrder.coupon_code,
          tempOrder.coupon_discount,
          tempOrder.shipping_charge,
          tempOrder.additional_charge,
          tempOrder.payment_mode,
          tempOrder.payment_option,
          "Error",
          "Error",
          razorpay_payment_id || "ERROR",
          "Application"
        ];

        const [emergencyResult] = await pool.execute(emergencyOrderQuery, emergencyOrderValues);
        newOrderId = emergencyResult.insertId;

        if (newOrderId) {
          // Update with transaction number
          await pool.execute(`
            UPDATE cp_order 
            SET databaseOrderID = ?, transaction_number = ?
            WHERE order_id = ?
          `, [newOrderId, `PH-${newOrderId}`, newOrderId]);

          // Save order details if available
          if (tempOrderDetails && tempOrderDetails.length > 0) {
            for (const detail of tempOrderDetails) {
              try {
                const insertOrderDetailQuery = `
                  INSERT INTO cp_order_details 
                  (order_id, product_id, product_name, product_image, unit_price, unit_quantity, tax_percent, tax_amount, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                `;

                await pool.execute(insertOrderDetailQuery, [
                  newOrderId,
                  detail.product_id || null,
                  detail.product_name ? String(detail.product_name).substring(0, 255) : null,
                  detail.product_image ? String(detail.product_image).substring(0, 500) : null,
                  parseFloat(detail.unit_price) || 0,
                  parseInt(detail.unit_quantity) || 0,
                  parseFloat(detail.tax_percent) || 0,
                  parseFloat(detail.tax_amount) || 0,
                ]);
              } catch (detailError) {
                console.error("Error saving emergency detail:", detailError);
              }
            }
          }

          console.log("✅ Emergency order saved with ID:", newOrderId);
        }
      }

      // Update temporary order with error status
      if (razorpay_order_id) {
        const updateOrderFailed = `
          UPDATE cp_order_temp
          SET status = ?, payment_status = ?, transaction_number = ?
          WHERE razorpayOrderID = ?
        `;

        await pool.execute(updateOrderFailed, [
          "Error",
          "Error",
          razorpay_payment_id || "ERROR",
          razorpay_order_id,
        ]);

        console.log("✅ Temporary order marked with error status");
      }

      // Send immediate alert to admin
      await sendAdminAlert("Critical Payment Processing Error",
        `Critical error occurred during payment verification`, {
        razorpay_payment_id,
        razorpay_order_id,
        order_id: newOrderId,
        temp_order_id: tempOrder?.order_id,
        customer_name: tempOrder?.customer_name,
        customer_phone: tempOrder?.customer_phone,
        amount: tempOrder?.amount,
        error_context: errorContext,
        error_message: error.message,
        error_stack: error.stack
      });

    } catch (emergencyError) {
      console.error("❌ Emergency error handling failed:", emergencyError);
    }

    return res.status(500).json({
      success: false,
      message: "We encountered a technical issue while processing your payment. Your order details have been saved and our team will contact you shortly to resolve this.",
      order_id: newOrderId,
      error_code: "PAYMENT_PROCESSING_ERROR"
    });
  }
};

// Helper function to update order status
async function updateOrderStatus(orderId, status, paymentStatus, transactionNumber) {
  try {
    const updateQuery = `
      UPDATE cp_order 
      SET status = ?, payment_status = ?, transaction_number = ?
      WHERE order_id = ?
    `;
    await pool.execute(updateQuery, [status, paymentStatus, transactionNumber, orderId]);
    console.log(`✅ Order ${orderId} status updated to ${status}/${paymentStatus}`);
  } catch (error) {
    console.error(`❌ Failed to update order ${orderId} status:`, error);
  }
}

// Helper function to send admin alerts
async function sendAdminAlert(subject, description, errorDetails) {
  const adminPhone = "7217619794";
  const adminEmail = "oncohealthmart@gmail.com";

  // Format error details for WhatsApp
  const whatsappMessage = `
🚨 *URGENT: ${subject}* 🚨

${description}

*Error Details:*
${errorDetails.razorpay_payment_id ? `• Payment ID: ${errorDetails.razorpay_payment_id}\n` : ''}${errorDetails.razorpay_order_id ? `• Order ID: ${errorDetails.razorpay_order_id}\n` : ''}${errorDetails.order_id ? `• System Order ID: ${errorDetails.order_id}\n` : ''}${errorDetails.customer_name ? `• Customer: ${errorDetails.customer_name}\n` : ''}${errorDetails.customer_phone ? `• Phone: ${errorDetails.customer_phone}\n` : ''}${errorDetails.amount ? `• Amount: ₹${errorDetails.amount}\n` : ''}${errorDetails.error_context ? `• Context: ${errorDetails.error_context}\n` : ''}${errorDetails.error_message ? `• Error: ${errorDetails.error_message}\n` : ''}
*Time:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Please investigate immediately!
  `.trim();

  // Format error details for Email
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #ff4444; color: white; padding: 20px; text-align: center;">
        <h1>🚨 URGENT ALERT: ${subject}</h1>
      </div>
      <div style="padding: 20px; background-color: #f9f9f9;">
        <h2>Description</h2>
        <p>${description}</p>
        
        <h2>Error Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          ${Object.entries(errorDetails).map(([key, value]) =>
    value ? `<tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${key.replace(/_/g, ' ').toUpperCase()}</td><td style="border: 1px solid #ddd; padding: 8px;">${value}</td></tr>` : ''
  ).join('')}
        </table>
        
        <h2>Timestamp</h2>
        <p>${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
        
        <div style="background-color: #ffeeee; padding: 15px; margin-top: 20px; border-left: 4px solid #ff4444;">
          <strong>Action Required:</strong> Please investigate this issue immediately and contact the customer if necessary.
        </div>
      </div>
    </div>
  `;

  // Send WhatsApp alert
  try {
    await sendMessage({
      mobile: adminPhone,
      msg: whatsappMessage,
    });
    console.log("✅ Admin WhatsApp alert sent");
  } catch (whatsappError) {
    console.error("❌ Failed to send WhatsApp alert:", whatsappError);
  }

  // Send Email alert
  try {
    const mail_options = {
      from: "Onco Health Mart Alert <noreply@oncohealthmart.com>",
      to: adminEmail,
      subject: `🚨 URGENT: ${subject}`,
      html: emailHtml,
    };

    await sendEmail(mail_options);
    console.log("✅ Admin email alert sent");
  } catch (emailError) {
    console.error("❌ Failed to send email alert:", emailError);
  }
}

// Helper function to generate receipt HTML
function generateReceiptHTML(order_details_after) {
  return `<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f0f7ff;">
    <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <tr>
            <td style="text-align: center; padding: 30px 0; background: linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%); border-radius: 12px;">
                <img src="https://i.ibb.co/kSpzZn4/onco-health-mart-logo.png" alt="Onco Health Mart Logo" style="max-width: 250px; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.2));">
            </td>
        </tr>
        
        <tr>
            <td style="padding: 30px 20px;">
                <div style="background: linear-gradient(135deg, #f6f9ff 0%, #f1f6ff 100%); border: 1px solid #e0e9ff; border-radius: 12px; padding: 20px; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <h2 style="color: #1e3c72; margin: 0 0 15px 0; font-size: 24px; border-bottom: 2px solid #2a5298; padding-bottom: 10px;">Order Confirmation</h2>
                    <p style="margin: 8px 0; color: #2a5298; font-size: 16px;">Order ID: <span style="color: #4a6fa5; font-weight: 500;">${order_details_after?.transaction_number
    }</span></p>
                    <p style="margin: 8px 0; color: #2a5298; font-size: 16px;">Date: <span style="color: #4a6fa5; font-weight: 500;">${new Date(
      order_details_after?.order_date
    ).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}</span></p>
                    <p style="margin: 8px 0; font-size: 16px;"><span style="background-color: #4CAF50; color: white; padding: 5px 12px; border-radius: 20px; font-size: 14px;">✓ ${order_details_after?.status
    }</span></p>
                </div>

                <div style="background: linear-gradient(135deg, #f6f9ff 0%, #f1f6ff 100%); border: 1px solid #e0e9ff; border-radius: 12px; padding: 20px; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <h3 style="color: #1e3c72; margin: 0 0 15px 0; font-size: 20px;">📍 Shipping Details</h3>
                    <p style="margin: 8px 0; color: #4a6fa5; line-height: 1.6;">
                        <strong style="color: #2a5298; font-size: 18px;">${order_details_after?.customer_shipping_name
    }</strong><br>
                        ${order_details_after?.customer_shipping_address}<br>
                        PIN: ${order_details_after?.customer_shipping_pincode
    }<br>
                        📱 Phone: ${order_details_after?.customer_shipping_phone
    }
                    </p>
                </div>

                <div style="background: linear-gradient(135deg, #f6f9ff 0%, #f1f6ff 100%); border: 1px solid #e0e9ff; border-radius: 12px; padding: 20px; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <h3 style="color: #1e3c72; margin: 0 0 15px 0; font-size: 20px;">🛍️ Order Details</h3>
                    <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                        <tr style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);">
                            <th style="padding: 12px; text-align: left; color: white; border-radius: 8px 0 0 0;">Product</th>
                            <th style="padding: 12px; text-align: right; color: white;">Quantity</th>
                            <th style="padding: 12px; text-align: right; color: white; border-radius: 0 8px 0 0;">Price</th>
                        </tr>
                        ${order_details_after?.details
      ?.map(
        (item) => `
                        <tr style="background-color: white;">
                            <td style="padding: 12px; border-bottom: 1px solid #e0e9ff; color: #2a5298;">${item.product_name
          }</td>
                            <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e0e9ff; color: #4a6fa5;">${item.unit_quantity
          }</td>
                            <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e0e9ff; color: #4a6fa5;">₹${item.unit_price.toFixed(
            2
          )}</td>
                        </tr>
                        `
      )
      .join("") || ""
    }
                    </table>
                </div>

                <div style="background: linear-gradient(135deg, #f6f9ff 0%, #f1f6ff 100%); border: 1px solid #e0e9ff; border-radius: 12px; padding: 20px; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <table cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td style="padding: 8px 0; color: #2a5298;">Subtotal:</td>
                            <td style="text-align: right; color: #4a6fa5;">₹${order_details_after?.subtotal?.toFixed(2) ||
    "0.00"
    }</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #2a5298;">Shipping:</td>
                            <td style="text-align: right; color: #4a6fa5;">₹${order_details_after?.shipping_charge?.toFixed(
      2
    ) || "0.00"
    }</td>
                        </tr>
                        ${order_details_after?.coupon_discount
      ? `
                        <tr>
                            <td style="padding: 8px 0; color: #2a5298;">Discount (${order_details_after.coupon_code
      }):</td>
                            <td style="text-align: right; color: #4CAF50;">-₹${order_details_after.coupon_discount.toFixed(
        2
      )}</td>
                        </tr>
                        `
      : ""
    }
                        <tr style="font-weight: bold; font-size: 18px;">
                            <td style="padding: 15px 0; border-top: 2px solid #2a5298; color: #1e3c72;">Total:</td>
                            <td style="text-align: right; padding: 15px 0; border-top: 2px solid #2a5298; color: #1e3c72;">₹${order_details_after?.amount?.toFixed(2) || "0.00"
    }</td>
                        </tr>
                    </table>
                </div>

                <div style="margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); border-radius: 12px; color: white;">
                    <p style="margin: 5px 0;">💳 Payment Method: ${order_details_after?.payment_mode || "N/A"
    }</p>
                </div>

                <div style="margin-top: 30px; text-align: center; background: linear-gradient(135deg, #f6f9ff 0%, #f1f6ff 100%); padding: 20px; border-radius: 12px;">
                    <h3 style="color: #1e3c72; margin: 0 0 10px 0;">Thank you for shopping with Onco Health Mart! ❤️</h3>
                    <p style="color: #4a6fa5; margin: 0;">If you have any questions, please contact our customer service.</p>
                </div>
            </td>
        </tr>
    </table>
  </body>`;
}

// Helper function to generate WhatsApp message
function generateWhatsAppMessage(order_details_after) {
  return `🛒 *Order Confirmation*\n\n📌 *Order ID:* ${order_details_after?.transaction_number
    }\n📅 *Date:* ${new Date(order_details_after?.order_date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    )}\n✅ *Status:* ${order_details_after?.status
    }\n\n📍 *Shipping Details:*\n👤 *Name:* ${order_details_after?.customer_shipping_name
    }\n🏠 *Address:* ${order_details_after?.customer_shipping_address
    }\n📮 *PIN:* ${order_details_after?.customer_shipping_pincode}\n📞 *Phone:* ${order_details_after?.customer_shipping_phone
    }\n\n🛍️ *Order Details:*\n${order_details_after?.details
      ?.map(
        (item) =>
          `🔹 *${item.product_name}*\n   - Quantity: ${item.unit_quantity
          }\n   - Price: ₹${item.unit_price.toFixed(2)}`
      )
      .join("\n") || "No products found"
    }\n\n💰 *Payment Summary:*\n💵 *Subtotal:* ₹${order_details_after?.subtotal?.toFixed(2) || "0.00"
    }\n🚚 *Shipping:* ₹${order_details_after?.shipping_charge?.toFixed(2) || "0.00"
    }\n${order_details_after?.coupon_discount
      ? `🎟️ *Discount (${order_details_after.coupon_code
      }):* -₹${order_details_after.coupon_discount.toFixed(2)}`
      : ""
    }\n💳 *Total:* ₹${order_details_after?.amount?.toFixed(2) || "0.00"
    }\n\n💳 *Payment Method:* ${order_details_after?.payment_mode || "N/A"
    }\n\n🙏 *Thank you for shopping with Onco Health Mart! ❤️*\n📞 For any queries, contact our customer service.`;
}

async function find_Details_Order(razorpay_order_id) {
  try {
    // Fetch the first order matching the razorpayOrderID
    const sqlQuery = `SELECT * FROM cp_order WHERE razorpayOrderID = ? LIMIT 1`;
    const [orders] = await pool.execute(sqlQuery, [razorpay_order_id]);

    if (orders.length === 0) {
      throw new Error("Order not found");
    }

    const order = orders[0];

    const orderDetailsSql = `SELECT * FROM cp_app_order_details WHERE order_id = ?`;
    const [orderDetails] = await pool.execute(orderDetailsSql, [
      order.order_id,
    ]);

    order.details = orderDetails;

    console.log("i am bond", order);
    return order;
  } catch (error) {
    console.error("Error fetching order details:", error);
    return error;
  }
}

exports.checkCouponCode = async (req, res) => {
  try {
    const { couponCode, ProductsFromCart, totalPrice } = req.body;

    // Validate request
    if (!couponCode) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required.",
      });
    }

    if (
      !ProductsFromCart ||
      !Array.isArray(ProductsFromCart) ||
      ProductsFromCart.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty or invalid.",
      });
    }

    if (!totalPrice || totalPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid total price.",
      });
    }

    // Fetch coupon details from the database
    const [couponDetails] = await pool.query(
      "SELECT * FROM cp_app_offer WHERE CODE = ? ",
      [couponCode]
    );

    if (!couponDetails || couponDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired coupon code.",
      });
    }

    const coupon = couponDetails[0];

    // Check minimum order value eligibility
    if (totalPrice < coupon.min_order_value) {
      return res.status(400).json({
        success: false,
        message: `Coupon is not applicable. Minimum order value required is ₹${coupon.min_order_value}.`,
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === "Amount") {
      discount = Math.min(coupon.maxDiscount, coupon.discount_amount || 0);
    } else if (coupon.discount_type === "Percentage") {
      discount = Math.min(
        Math.ceil((coupon.percenatge_off / 100) * totalPrice)
      );
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid discount type in coupon.",
      });
    }

    if (discount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Coupon does not provide any discount for the current cart.",
      });
    }

    const grandTotal = totalPrice - discount;

    // Return success response
    return res.status(200).json({
      success: true,
      message: `Coupon applied successfully! You saved ₹${discount}.`,
      discount: discount,
      grandTotal: grandTotal,
    });
  } catch (error) {
    console.error("Error applying coupon:", error);
    return res.status(500).json({
      success: false,
      message:
        "An error occurred while applying the coupon. Please try again later.",
    });
  }
};

exports.Create_repeat_Order = async (req, res) => {
  try {
    const re_order = req.params.id;

    // Validate user authentication
    const userId = req.user?.id?.customer_id;
    if (!userId) {
      return res.status(401).json({
        message: "Authentication required. Please log in to complete the order.",
      });
    }

    // Check if user exists in the database
    const checkUserSql = `SELECT * FROM cp_customer WHERE customer_id = ?`;
    const [userExists] = await pool.execute(checkUserSql, [userId]).catch((err) => {
      console.error("Database error when checking user:", err);
      throw new Error("Failed to verify user information.");
    });

    if (!userExists || userExists.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    // Find the past order
    const findPastOrder = `SELECT * FROM cp_order WHERE order_id = ? AND customer_id = ?`;
    const [order_check] = await pool.execute(findPastOrder, [re_order, userId]).catch((err) => {
      console.error("Database error when checking past order:", err);
      throw new Error("Failed to retrieve past order information.");
    });

    if (order_check.length === 0) {
      return res.status(404).json({ message: "Past order not found or doesn't belong to you." });
    }

    const pastOrder = order_check[0];

    if (!pastOrder?.order_id) {
      throw new Error("Order ID not found. Please check the order details.");
    }

    // Get order details from past order
    const orderDetailsSql = `SELECT * FROM cp_app_order_details WHERE order_id = ?`;
    const [orderDetails] = await pool.execute(orderDetailsSql, [pastOrder?.order_id]).catch((err) => {
      console.error("Database error when fetching order details:", err);
      throw new Error("Failed to retrieve order details.");
    });

    if (!orderDetails || orderDetails.length === 0) {
      return res.status(400).json({ message: "No product details found in the past order." });
    }

    // Get system settings
    const settingsQuery = `SELECT * FROM cp_settings`;
    const [settings] = await pool.execute(settingsQuery).catch((err) => {
      console.error("Database error when fetching settings:", err);
      throw new Error("Failed to retrieve system settings.");
    });

    if (!settings || settings.length === 0) {
      return res.status(500).json({ message: "System settings not available." });
    }

    const setting = settings[0];

    // ===== FIXED CALCULATION SECTION =====
    console.log("=== ORDER CALCULATION DEBUG ===");

    // Calculate subtotal and tax from order items
    let subtotal = 0;
    let totalTaxAmount = 0;

    orderDetails.forEach(item => {
      const itemSubtotal = parseFloat(item.unit_price) * parseInt(item.unit_quantity);
      const itemTaxAmount = parseFloat(item.tax_amount || 0);

      subtotal += itemSubtotal;
      totalTaxAmount += itemTaxAmount;

      console.log(`Item: ${item.product_name}`);
      console.log(`  Price: ₹${item.unit_price} × ${item.unit_quantity} = ₹${itemSubtotal}`);
      console.log(`  Tax: ₹${itemTaxAmount}`);
    });

    console.log(`Subtotal: ₹${subtotal}`);
    console.log(`Total Tax: ₹${totalTaxAmount}`);

    // Calculate additional charges
    const shippingThreshold = parseFloat(setting?.shipping_threshold || 0);
    const shippingCharge = subtotal > shippingThreshold ? 0 : parseFloat(setting?.shipping_charge || 0);
    const extraCharges = pastOrder?.payment_option === "COD" ? parseFloat(setting?.cod_fee || 0) : 0;
    const couponDiscount = parseFloat(pastOrder?.coupon_discount || 0);

    console.log(`Shipping Threshold: ₹${shippingThreshold}`);
    console.log(`Shipping Charge: ₹${shippingCharge}`);
    console.log(`Extra Charges (COD): ₹${extraCharges}`);
    console.log(`Coupon Discount: ₹${couponDiscount}`);

    // Final amount calculation
    const finalAmount = subtotal + totalTaxAmount + shippingCharge + extraCharges - couponDiscount;

    console.log(`Final Amount Calculation:`);
    console.log(`₹${subtotal} + ₹${totalTaxAmount} + ₹${shippingCharge} + ₹${extraCharges} - ₹${couponDiscount} = ₹${finalAmount}`);
    console.log("=== CALCULATION DEBUG END ===");

    // Create timestamp for order tracking
    const orderDate = new Date();
    const formattedDate = orderDate.toISOString().slice(0, 19).replace("T", " ");

    // Verify prescription if exists
    let newRxId = pastOrder?.prescription_id || null;
    if (newRxId) {
      const prescriptionQuery = `SELECT * FROM cp_app_prescription WHERE id = ?`;
      const [prescription] = await pool.execute(prescriptionQuery, [newRxId]).catch((err) => {
        console.error("Database error when checking prescription:", err);
        // Don't throw error, just set to null
        newRxId = null;
      });

      if (!prescription || prescription.length === 0) {
        newRxId = null; // Clear invalid prescription ID
      }
    }

    // Create new order object based on past order
    const Order = {
      order_date: formattedDate,
      orderFrom: "Application",
      customer_id: userExists[0]?.customer_id,
      prescription_id: newRxId || "",
      hospital_name: pastOrder?.hospital_name || "",
      doctor_name: pastOrder?.doctor_name || "",
      prescription_notes: pastOrder?.prescription_notes || "",
      customer_name: pastOrder?.customer_name,
      patient_name: pastOrder?.patient_name || pastOrder?.customer_name,
      customer_email: userExists[0]?.email_id,
      customer_phone: pastOrder?.customer_phone,
      customer_address: pastOrder?.customer_address,
      customer_pincode: pastOrder?.customer_pincode,
      customer_shipping_name: pastOrder?.customer_shipping_name,
      customer_shipping_phone: pastOrder?.customer_shipping_phone,
      customer_shipping_address: pastOrder?.customer_shipping_address,
      customer_shipping_pincode: pastOrder?.customer_shipping_pincode,
      amount: finalAmount, // ✅ FIXED: Using correct finalAmount
      subtotal: subtotal,
      order_gst: totalTaxAmount.toFixed(2), // ✅ FIXED: Format tax properly
      coupon_code: pastOrder?.coupon_code || "",
      coupon_discount: couponDiscount,
      shipping_charge: shippingCharge,
      additional_charge: extraCharges,
      payment_mode: pastOrder?.payment_mode || "Razorpay",
      payment_option: pastOrder?.payment_option || "Online",
      status: newRxId && pastOrder?.payment_option
        ? pastOrder?.payment_option === "Online"
          ? "Pending"
          : "New"
        : "Prescription Pending",
    };

    console.log("New Order from past order:", Order);

    // Prepare product details from past order
    const ProductInOrder = orderDetails.map((item) => ({
      product_id: item?.product_id,
      product_name: item?.product_name,
      product_image: item?.product_image,
      unit_price: parseFloat(item?.unit_price),
      unit_quantity: parseInt(item?.unit_quantity),
      tax_percent: parseFloat(item?.tax_percent || 0).toFixed(2),
      tax_amount: parseFloat(item?.tax_amount || 0).toFixed(2),
    }));

    console.log("ProductInOrder:", ProductInOrder);

    // SQL queries
    const sqlOrderDetails = `
        INSERT INTO cp_app_order_details 
        (order_id, product_id, product_name, product_image, unit_price, unit_quantity, tax_percent, tax_amount) 
        VALUES (?,?,?,?,?,?,?,?)`;

    const insertOrderDetailQuery = `
        INSERT INTO cp_order_details 
        (order_id, product_id, product_name, product_image, unit_price, unit_quantity, tax_percent, tax_amount, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;

    const saveOrderSql = `
       INSERT INTO cp_order (
           order_date, orderFrom, customer_id, prescription_id, hospital_name, doctor_name, prescription_notes,
           customer_name, patient_name, customer_email, customer_phone, customer_address, customer_pincode,
           customer_shipping_name, customer_shipping_phone, customer_shipping_address, customer_shipping_pincode,
           amount, subtotal, order_gst, coupon_code, coupon_discount, shipping_charge, additional_charge,
           payment_mode, payment_option, status
       ) VALUES (
           ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
       )`;

    const saveOrderInTemp = `
       INSERT INTO cp_order_temp (
           order_date, razorpayOrderID, orderFrom, customer_id, prescription_id, hospital_name, doctor_name, prescription_notes,
           customer_name, patient_name, customer_email, customer_phone, customer_address, customer_pincode,
           customer_shipping_name, customer_shipping_phone, customer_shipping_address, customer_shipping_pincode,
           amount, subtotal, order_gst, coupon_code, coupon_discount, shipping_charge, additional_charge,
           payment_mode, payment_option, status
       ) VALUES (
           ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
       )`;

    // Process order based on payment option
    if (pastOrder?.payment_option === "Online") {
      // Handle online payment with Razorpay
      try {
        const razorpay = new CreateOrderRazorpay();
        const amount = finalAmount; // ✅ FIXED: Use finalAmount consistently
        const sendOrder = await razorpay.createOrder(amount);

        // Prepare temporary order for Razorpay
        const TempOrder = {
          order_date: formattedDate,
          razorpayOrderID: sendOrder.id,
          orderFrom: "Application",
          customer_id: userExists[0]?.customer_id,
          prescription_id: newRxId || "",
          hospital_name: pastOrder?.hospital_name || "",
          doctor_name: pastOrder?.doctor_name || "",
          prescription_notes: pastOrder?.prescription_notes || "",
          customer_name: pastOrder?.customer_name,
          patient_name: pastOrder?.patient_name || pastOrder?.customer_name,
          customer_email: userExists[0]?.email_id,
          customer_phone: pastOrder?.customer_phone,
          customer_address: pastOrder?.customer_address,
          customer_pincode: pastOrder?.customer_pincode,
          customer_shipping_name: pastOrder?.customer_shipping_name,
          customer_shipping_phone: pastOrder?.customer_shipping_phone,
          customer_shipping_address: pastOrder?.customer_shipping_address,
          customer_shipping_pincode: pastOrder?.customer_shipping_pincode,
          amount: finalAmount, // ✅ FIXED: Use finalAmount
          subtotal: subtotal,
          order_gst: totalTaxAmount.toFixed(2),
          coupon_code: pastOrder?.coupon_code || "",
          coupon_discount: couponDiscount,
          shipping_charge: shippingCharge,
          additional_charge: extraCharges,
          payment_mode: pastOrder?.payment_mode || "Razorpay",
          payment_option: "Online",
          status: "Pending",
        };

        const orderValuesTemp = Object.values(TempOrder);

        // Save temporary order
        const [saveOrder] = await pool.execute(saveOrderInTemp, orderValuesTemp).catch((err) => {
          console.error("Database error when saving temporary order:", err);
          throw new Error("Failed to create temporary order.");
        });

        // Save order details
        for (const item of ProductInOrder) {
          const orderDetailsValues = [
            saveOrder.insertId,
            item.product_id,
            item.product_name,
            item.product_image,
            item.unit_price,
            item.unit_quantity,
            item.tax_percent,
            item.tax_amount,
          ];

          await pool.execute(sqlOrderDetails, orderDetailsValues).catch((err) => {
            console.error(`Database error when saving product ${item.product_name}:`, err);
            // Continue with other products even if one fails
          });
        }

        console.log("Repeat Order (Online) - TempOrder:", TempOrder);

        // Send admin notification for pending online payment
        await sendAdminOrderNotification({
          order: TempOrder,
          products: ProductInOrder,
          customer: userExists[0],
          isTemp: true,
          orderId: saveOrder.insertId,
          razorpayOrderId: sendOrder.id,
        });

        return res.status(201).json({
          message: "Repeat order created successfully. Please complete payment.",
          sendOrder,
        });
      } catch (error) {
        console.error("Error processing online payment for repeat order:", error);
        return res.status(500).json({
          message: "Failed to process payment request for repeat order.",
          error: error.message,
        });
      }
    } else {
      // Handle COD repeat order
      try {
        console.log("=== COD REPEAT ORDER PROCESSING STARTED ===");
        console.log("Repeat Order Details:", Order);
        console.log("Products in Repeat Order:", ProductInOrder);

        const orderValues = Object.values(Order);

        // Save order
        const [orderPlaced] = await pool.execute(saveOrderSql, orderValues).catch((err) => {
          console.error("Database error when saving repeat order:", err);
          throw new Error("Failed to create repeat order.");
        });

        if (!orderPlaced?.insertId) {
          throw new Error("Failed to retrieve order ID after saving repeat order.");
        }

        const newOrderId = orderPlaced.insertId;
        const transactionNumber = `PH-${newOrderId}`;

        console.log(`COD Repeat Order created with ID: ${newOrderId}`);
        console.log(`Transaction Number: ${transactionNumber}`);

        // Update order with generated ID and transaction number
        const updateOrderQuery = `
          UPDATE cp_order
          SET databaseOrderID = ?, transaction_number = ?
          WHERE order_id = ?
        `;

        await pool.execute(updateOrderQuery, [newOrderId, transactionNumber, newOrderId]).catch((err) => {
          console.error("Database error when updating repeat order with transaction number:", err);
          // Continue even if this update fails
        });

        console.log("Repeat Order updated with transaction number successfully");

        // Process each product in the repeat order
        console.log("=== SAVING REPEAT ORDER PRODUCTS TO BOTH TABLES ===");

        for (const [index, item] of ProductInOrder.entries()) {
          console.log(`Processing repeat order product ${index + 1}:`, item.product_name);

          const orderDetailsValues = [
            newOrderId,
            item.product_id,
            item.product_name,
            item.product_image,
            item.unit_price,
            item.unit_quantity,
            item.tax_percent,
            item.tax_amount,
          ];

          try {
            // Insert into cp_app_order_details
            await pool.execute(sqlOrderDetails, orderDetailsValues);
            console.log(`✓ Product ${item.product_name} saved to cp_app_order_details`);

            // Insert into cp_order_details (ONLY FOR COD)
            await pool.execute(insertOrderDetailQuery, orderDetailsValues);
            console.log(`✓ Product ${item.product_name} saved to cp_order_details`);

          } catch (productError) {
            console.error(`❌ Error inserting repeat order product ${item.product_name}:`, productError);
            // Continue with other products even if one fails
          }
        }

        console.log(`=== REPEAT ORDER PRODUCT INSERTION COMPLETED ===`);
        console.log(`Total products processed: ${ProductInOrder.length}`);

        // ✅ FIXED: Compose WhatsApp order confirmation message with correct total
        const message = generateOrderConfirmationMessage({
          orderNumber: transactionNumber,
          customerName: pastOrder?.customer_name,
          items: ProductInOrder,
          subtotal: subtotal,
          shipping: shippingCharge,
          extraCharges,
          total: finalAmount, // ✅ FIXED: Use finalAmount instead of Order.subtotal
          paymentMethod: "Cash on Delivery",
        });

        // Send WhatsApp message to customer
        const userMobile = userExists[0]?.mobile || pastOrder?.customer_phone;
        if (userMobile) {
          try {
            await sendMessage({
              mobile: userMobile,
              msg: message,
            });
            console.log(`WhatsApp message sent for repeat order to: ${userMobile}`);
          } catch (messageError) {
            console.error("Failed to send WhatsApp notification for repeat order:", messageError);
            // Continue even if message fails
          }
        }

        console.log("Repeat Order (COD) Details:", Order);

        // Send email notification to admin
        await sendAdminOrderNotification({
          order: {
            ...Order,
            order_id: newOrderId,
            transaction_number: transactionNumber,
          },
          products: ProductInOrder,
          customer: userExists[0],
          isTemp: false,
          orderId: newOrderId,
        });

        console.log("Admin notification sent successfully for repeat order");
        console.log("=== COD REPEAT ORDER PROCESSING COMPLETED ===");

        // Respond to client
        return res.status(201).json({
          message: "Repeat order created successfully.",
          orderId: newOrderId,
          transactionNumber,
          orderDetails: {
            subtotal: subtotal,
            tax: totalTaxAmount,
            shipping: shippingCharge,
            extraCharges: extraCharges,
            discount: couponDiscount,
            finalAmount: finalAmount
          }
        });
      } catch (error) {
        console.error("Error creating COD repeat order:", error);
        return res.status(500).json({
          message: "An error occurred while creating the repeat order.",
          error: error.message,
        });
      }
    }
  } catch (error) {
    console.error("Error in Create_repeat_Order:", error);
    return res.status(500).json({
      message: "An unexpected error occurred while creating repeat order. Please try again later.",
      error: error.message,
    });
  }
};
//admin
exports.get_all_order = async (req, res) => {
  try {
    const redis = req.app.locals?.redis;

    if (!redis) {
      return res
        .status(500)
        .json({ success: false, message: "Redis client not available" });
    }

    // Fetch orders from the database
    const orders = await fetchOrdersFromDatabase();
    if (!orders.length) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found" });
    }

    // Extract order IDs for fetching details
    const orderIds = orders.map((order) => order.order_id);

    // Fetch order details with pagination
    const orderDetails = await fetchOrderDetails(
      orderIds,
      req.query.search_query
    );

    // Map order details by order ID
    const orderDetailsMap = mapOrderDetailsById(orderDetails);

    // Merge orders with details
    const updatedOrders = mergeOrdersWithDetails(orders, orderDetailsMap);

    // Cache the result in Redis
    redis.setex("ordersCache", 3600, JSON.stringify(updatedOrders));

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: updatedOrders,
      totalOrders: orders.length,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Function to fetch orders from the database
async function fetchOrdersFromDatabase() {
  const sqlQuery = "SELECT * FROM cp_order WHERE 1=1";
  const [orders] = await pool.execute(sqlQuery);
  return orders;
}

// Function to fetch order details with pagination
async function fetchOrderDetails(orderIds) {
  const orderDetailsLimit = 1000;
  const batchSize = Math.ceil(orderIds.length / orderDetailsLimit);

  const orderDetails = [];

  for (let i = 0; i < batchSize; i++) {
    const batchOrderIds = orderIds.slice(
      i * orderDetailsLimit,
      (i + 1) * orderDetailsLimit
    );

    // Log batchOrderIds to see which IDs are being processed
    console.log(`Batch ${i + 1} of ${batchSize}: `, batchOrderIds);

    // Prepare the SQL query
    let orderDetailsSql =
      "SELECT * FROM cp_app_order_details WHERE order_id IN (?)";
    console.log(`Executing SQL Query: `, orderDetailsSql);

    // Log the parameters being passed to the query
    console.log(`Query Parameters: `, [batchOrderIds]);

    try {
      const [batchOrderDetails] = await pool.execute(orderDetailsSql, [
        batchOrderIds,
      ]);

      // Log the result to see the order details returned from the database
      console.log(`Batch ${i + 1} Result: `, batchOrderDetails);

      // Push the result into the orderDetails array
      orderDetails.push(...batchOrderDetails);
    } catch (error) {
      console.error(`Error executing query for Batch ${i + 1}:`, error);
    }
  }

  // Final result log
  console.log("All Order Details: ", orderDetails);

  return orderDetails;
}

// Function to map order details by order ID
function mapOrderDetailsById(orderDetails) {
  return orderDetails.reduce((map, detail) => {
    map[detail.order_id] = map[detail.order_id] || [];
    map[detail.order_id].push(detail);
    return map;
  }, {});
}

// Function to merge orders with their details
function mergeOrdersWithDetails(orders, orderDetailsMap) {
  return orders.map((order) => ({
    ...order,
    details: orderDetailsMap[order.order_id] || [],
  }));
}

exports.changeOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId) {
      return res.status(403).json({
        success: false,
        message: "Please provide Order ID in the request body",
      });
    }

    const findOrder = `SELECT * FROM cp_order WHERE order_id = ?`;
    const [order] = await pool.execute(findOrder, [orderId]);

    if (order.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order with this Order ID not found",
      });
    }

    const updateQuery = `UPDATE cp_order SET status = ? WHERE order_id = ?`;
    const [orderUpdate] = await pool.execute(updateQuery, [status, orderId]);

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: orderUpdate,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.changePrescriptionStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId) {
      return res.status(403).json({
        success: false,
        message: "Please provide Order ID in the request body",
      });
    }

    const findOrder = `SELECT * FROM cp_app_prescription WHERE id = ?`;
    const [order] = await pool.execute(findOrder, [orderId]);

    if (order.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order with this Order ID not found",
      });
    }

    const updateQuery = `UPDATE cp_app_prescription SET status = ? WHERE id = ?`;
    const [orderUpdate] = await pool.execute(updateQuery, [status, orderId]);

    return res.status(200).json({
      success: true,
      message: "prescription status updated successfully",
      data: orderUpdate,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

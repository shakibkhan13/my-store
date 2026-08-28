interface OrderConfirmationEmailData {
    customerName: string;
    orderNumber: string;
    subtotal: string;
    discount: string;
    tax: string;
    shippingFee: string;
    grandTotal: string;
    currency: string;
    items: Array<{
        productName: string;
        sku: string;
        quantity: number;
        unitPrice: string;
        total: string;
    }>;
}

export const orderConfirmationEmail = (
    data: OrderConfirmationEmailData,
): string => {
    const itemsHtml = data.items
        .map(
            (item) => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #eee;">
            ${item.productName}
          </td>

          <td style="padding:12px;border-bottom:1px solid #eee;">
            ${item.sku}
          </td>

          <td style="padding:12px;border-bottom:1px solid #eee;text-align:center;">
            ${item.quantity}
          </td>

          <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;">
            ${data.currency} ${item.unitPrice}
          </td>

          <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;">
            ${data.currency} ${item.total}
          </td>
        </tr>
      `,
        )
        .join("");

    return `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8" />

<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<title>Order Confirmation</title>

</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f5f7fb;
    font-family:Arial,Helvetica,sans-serif;
  "
>

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  style="padding:40px 0;"
>

<tr>

<td align="center">

<table
  width="650"
  cellpadding="0"
  cellspacing="0"
  style="
    max-width:650px;
    width:100%;
    background:#ffffff;
    border-radius:10px;
    overflow:hidden;
  "
>

<tr>

<td
  style="
    background:#11375B;
    padding:30px;
    text-align:center;
    color:#ffffff;
  "
>

<h1 style="margin:0;">
Order Confirmed
</h1>

<p style="margin:10px 0 0;">
Thank you for your order, ${data.customerName}.
</p>

</td>

</tr>

<tr>

<td style="padding:30px;">

<h2 style="margin-top:0;">
Order #${data.orderNumber}
</h2>

<p>
Your order has been successfully confirmed.
</p>

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  style="
    border-collapse:collapse;
    margin-top:25px;
    font-size:14px;
  "
>

<thead>

<tr style="background:#f5f7fb;">

<th style="padding:12px;text-align:left;">
Product
</th>

<th style="padding:12px;text-align:left;">
SKU
</th>

<th style="padding:12px;text-align:center;">
Qty
</th>

<th style="padding:12px;text-align:right;">
Price
</th>

<th style="padding:12px;text-align:right;">
Total
</th>

</tr>

</thead>

<tbody>

${itemsHtml}

</tbody>

</table>

<table
  width="100%"
  style="margin-top:25px;"
>

<tr>

<td style="padding:6px 0;">
Subtotal
</td>

<td style="padding:6px 0;text-align:right;">
${data.currency} ${data.subtotal}
</td>

</tr>

<tr>

<td style="padding:6px 0;">
Discount
</td>

<td style="padding:6px 0;text-align:right;">
- ${data.currency} ${data.discount}
</td>

</tr>

<tr>

<td style="padding:6px 0;">
Tax
</td>

<td style="padding:6px 0;text-align:right;">
${data.currency} ${data.tax}
</td>

</tr>

<tr>

<td style="padding:6px 0;">
Shipping
</td>

<td style="padding:6px 0;text-align:right;">
${data.currency} ${data.shippingFee}
</td>

</tr>

<tr>

<td
  style="
    padding:15px 0;
    font-size:18px;
    font-weight:bold;
    border-top:2px solid #11375B;
  "
>
Grand Total
</td>

<td
  style="
    padding:15px 0;
    font-size:18px;
    font-weight:bold;
    text-align:right;
    border-top:2px solid #11375B;
  "
>
${data.currency} ${data.grandTotal}
</td>

</tr>

</table>

<p style="margin-top:30px;color:#666;">

We will keep you updated about your order status.

</p>

</td>

</tr>

<tr>

<td
  style="
    background:#f5f7fb;
    padding:20px;
    text-align:center;
    color:#777;
    font-size:13px;
  "
>

Thank you for shopping with us.

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
`;
};
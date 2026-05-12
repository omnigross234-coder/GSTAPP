// export const createInvoiceObject = (customer, product, amount, gst) => {
//   const total = Number(amount) + (Number(amount) * gst / 100);

//   return {
//     customer_name: customer,
//     product,
//     amount: Number(amount),
//     gst,
//     total
//   };
// };


export const createInvoiceObject = (data) => {
  const {
    customer_name,
    state,
    items,
    subtotal,
    cgst_amount,
    sgst_amount,
    igst_amount,
    total_amount,
    tax_type
  } = data;

  return {
    customer_name,
    state,

    // 🔥 items (for invoice_items table)
    items: items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.line_total
    })),

    // 🔥 totals (for invoices table)
    subtotal,
    cgst_amount,
    sgst_amount,
    igst_amount,
    total_amount,
    tax_type
  };
};
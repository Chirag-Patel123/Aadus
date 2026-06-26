// js/orders/placeOrder.js

async function placeOrder(orderData) {
    try {
        // Show loading
        console.log('Placing order...', orderData);
        
        // Generate order ID (AK-XXXXXX)
        const orderId = 'AK-' + Math.floor(Math.random() * 900000) + 100000;
        
        // Prepare data for Supabase
        const orderToSave = {
            id: orderId,
            customer_name: orderData.name,
            phone: orderData.phone,
            items_summary: orderData.itemsSummary,
            total: orderData.total,
            delivery_address: orderData.address,
            payment_method: orderData.paymentMethod || 'COD',
            status: 'Placed',
            created_at: new Date().toISOString(),
            notion_synced: false
        };
        
        console.log('Saving to Supabase:', orderToSave);
        
        // Save to Supabase
        const { data, error } = await window.supabaseClient
            .from('orders')
            .insert([orderToSave])
            .select();
        
        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }
        
        console.log('Order saved successfully:', data);
        
        return {
            success: true,
            orderId: orderId
        };
        
    } catch (error) {
        console.error('Place order error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
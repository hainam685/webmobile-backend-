import moment from 'moment';
import crypto from 'crypto';
import qs from 'qs';
import { vnp_TmnCode, vnp_HashSecret, vnp_Url, vnp_ReturnUrl } from '../vnPayConfig.js';
import { url } from 'inspector/promises';
import cart from '../models/cart.js';
import Order from '../models/order.js';
import product from '../models/product.js';

function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    for (let key of keys) {
        sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
    }
    return sorted;
}

export const createPayment = (req, res) => {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const orderId = moment(date).format('DDHHmmss');
    const amount = req.body.amount;
    const bankCode = req.body.bankCode;
    const orderInfo = req.body.orderInfo;
    const email = req.body.email;
    let locale = req.body.language || 'vn';

    let vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: vnp_TmnCode,
        vnp_Locale: locale,
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `${orderInfo} - ${orderId} - ${email}`,
        vnp_OrderType: 'other',
        vnp_Amount: amount * 100,
        vnp_ReturnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
    };


    if (bankCode) {
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    vnp_Params['vnp_SecureHash'] = signed;
    const paymentUrl = vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false });
    return res.json({ url: paymentUrl });
};

export const vnpayReturn = async (req, res) => {
    try {
        const vnp_Params = req.query;

        const responseCode = vnp_Params['vnp_ResponseCode'];
        if (responseCode !== '00') {
            return res.status(400).json({ message: 'Thanh toán không thành công' });
        }

        const orderId = vnp_Params['vnp_TxnRef'];
        const amount = parseInt(vnp_Params['vnp_Amount']) / 100;

        const orderInfo = vnp_Params['vnp_OrderInfo'];

        const emailMatch = orderInfo.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        const email = emailMatch ? emailMatch[0].trim() : null;

        if (!email) return res.status(400).json({ message: 'Không tìm thấy email từ orderInfo' });

        const cartData = await cart.findOne({ "userInfo.email": email });
        if (!cartData) return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });

        const newOrder = new Order({
            orderId,
            userId: cartData.userId,
            items: cartData.items,
            totalAmount: cartData.totalAmount,
            userInfo: cartData.userInfo,
            paymentStatus: 'success',
        });

        const savedOrder = await newOrder.save();

        for (const item of cartData.items) {
            await product.updateOne(
                {
                    _id: item.productId,
                    "roms.rom": item.rom,
                    "roms.variants.color": item.color
                },
                {
                    $inc: {
                        "roms.$[romElem].variants.$[variantElem].quantity": -item.quantity,
                        "roms.$[romElem].variants.$[variantElem].sold": item.quantity
                    }
                },
                {
                    arrayFilters: [
                        { "romElem.rom": item.rom },
                        { "variantElem.color": item.color }
                    ]
                }
            );
        }


        await cart.deleteOne({ _id: cartData._id });

        return res.status(200).json({ message: 'Thanh toán thành công' });

    } catch (error) {
        console.error('Lỗi khi xử lý trả về từ VNPay: ', error);
        return res.status(500).json({ message: 'Lỗi hệ thống, vui lòng thử lại sau' });
    }
};





import crypto from "crypto";
import querystring from "qs";
import { vnp_HashSecret } from "../vnPayConfig.js";

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (let key of keys) {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
  }
  return sorted;
}

const verifyVnpayHash = (req, res, next) => {
  const vnp_Params = { ...req.query };

  const secureHash = vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  const sortedParams = sortObject(vnp_Params);
  const signData = querystring.stringify(sortedParams, { encode: false });

  const hmac = crypto.createHmac("sha512", vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  if (secureHash === signed) {
    next();
  } else {
    res.status(400).json({ message: "Checksum không hợp lệ. Giao dịch có thể bị giả mạo!" });
  }
};

export default verifyVnpayHash;

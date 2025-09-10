import Products from "../models/product.js";

export const uploadProduct = async (req, res) => {
  try {
    const { name, category, description } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Hãy tải lên ít nhất một ảnh!" });
    }

    const roms = [];

    for (let romIndex = 0; romIndex < req.body.roms.length; romIndex++) {
      const rom = req.body.roms[romIndex].rom;
      const price = Number(req.body.roms[romIndex].price);

      const variants = [];
      const variantsData = req.body.roms[romIndex].variants;

      for (let variantIndex = 0; variantIndex < variantsData.length; variantIndex++) {
        const color = variantsData[variantIndex].color;
        const quantity = Number(variantsData[variantIndex].quantity);

        const imageField = `roms[${romIndex}][variants][${variantIndex}][image]`;
        const imageFile = req.files.find(file => file.fieldname === imageField);
        const image = imageFile ? `/uploads/${imageFile.filename}` : "";

        variants.push({ color, quantity, image });
      }

      roms.push({ rom, price, variants });
    }

    const existingProduct = await Products.findOne({ name, category });

    if (existingProduct) {
      roms.forEach(({ rom, price, variants }) => {
        let romEntry = existingProduct.roms.find(r => r.rom === rom);
        if (!romEntry) {
          existingProduct.roms.push({ rom, price, variants });
        } else {
          variants.forEach(({ color, quantity, image }) => {
            let variant = romEntry.variants.find(v => v.color === color);
            if (variant) {
              variant.quantity += quantity;
              variant.image = image;
            } else {
              romEntry.variants.push({ color, quantity, image });
            }
          });
        }
      });

      const updated = await existingProduct.save();
      return res.status(200).json(updated);
    }

    const newProduct = new Products({ name, category, roms, description });
    const saved = await newProduct.save();

    res.status(201).json(saved);
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server khi thêm sản phẩm" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getProducts = async (req, res) => {
  try {
    const products = await Products.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteVariant = async (req, res, next) => {
  try {
    const { productId, rom, color } = req.params;

    const product = await Products.findById(productId);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    const romIndex = product.roms.findIndex(r => r.rom === rom);
    if (romIndex === -1) return res.status(404).json({ message: "Không tìm thấy ROM" });

    product.roms[romIndex].variants = product.roms[romIndex].variants.filter(
      v => v.color !== color
    );

    if (product.roms[romIndex].variants.length === 0) {
      product.roms.splice(romIndex, 1);
    }

    await product.save();
    res.json({ message: "Xóa biến thể thành công", product });
  } catch (error) {
    next(error);
  }
};


export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!req.body) {
      return res.status(400).json({ message: "Dữ liệu gửi lên không hợp lệ." });
    }

    const { name, category, color, price, rom, quantity } = req.body;

    const product = await Products.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }

    product.name = name || product.name;
    product.category = category || product.category;

    if (rom && color) {
      const romObj = product.roms.find(r => r.rom === rom);
      if (!romObj) {
        return res.status(404).json({ message: "Không tìm thấy ROM phù hợp." });
      }

      if (price !== undefined) {
        romObj.price = price;
      }

      const variant = romObj.variants.find(v => v.color === color);
      if (!variant) {
        return res.status(404).json({ message: "Không tìm thấy biến thể màu trong ROM này." });
      }

      if (req.file) {
        variant.image = `/uploads/${req.file.filename}`;
      }

      if (quantity !== undefined) {
        variant.quantity = quantity;
      }
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi cập nhật sản phẩm." });
  }
};



export const getBestSellingProducts = async (req, res) => {
  try {
    const topProducts = await Products.find()
      .sort({ sold: -1 })
      .limit(10);

    res.json(topProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDiscountedProducts = async (req, res) => {
  try {
    const today = new Date();

    const discountedProducts = await Products.find({
      roms: {
        $elemMatch: {
          isDiscount: true,
          $or: [
            { discountEndDate: { $exists: false } },
            { discountEndDate: { $gte: today } }
          ]
        }
      }
    });

    res.status(200).json(discountedProducts);
  } catch (error) {
    res.status(500).json({ message: "Có lỗi khi lấy sản phẩm khuyến mãi!" });
  }
};


export const getCategory = async (req, res) => {
  try {
    const categories = await Products.distinct("category");
    res.status(200).json(categories);
  } catch (error) {
    console.error("Lỗi lấy danh mục:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh mục" });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({ message: 'Danh mục không hợp lệ.' });
    }

    const products = await Products.find({ category });
    if (products.length === 0) {
      return res.status(404).json({ message: `Không có sản phẩm nào trong danh mục ${category}.` });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi khi lấy sản phẩm', error: error.message });
  }
};

export const searchProduct = async (req, res) => {
  try {
        const { keyword } = req.query; 
        if (!keyword) {
            return res.status(400).json({ message: "Thiếu từ khóa tìm kiếm" });
        }

        const products = await Products.find({
            $or: [
                { name: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } }
            ]
        });

        res.json(products);
    } catch (error) {
        console.error("Lỗi tìm kiếm sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// models/flashSalesModel.js
module.exports = (sequelize, DataTypes) => {
    const FlashSale = sequelize.define("flash_sales", {
        product_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        discount: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
        },
        image_url: {  // Add this field
            type: DataTypes.STRING,
            allowNull: false,
        },
    });
    return FlashSale;
};

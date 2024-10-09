// models/flashSalesModel.js
module.exports = (sequelize, DataTypes) => {
    const BulkDeal = sequelize.define("flash_sales", {
        product_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        bulk_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        minimum_order_quantity: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
        },
        image_url: {  // Add this field
            type: DataTypes.STRING,
            allowNull: false,
        },
    });
    return BulkDeal;
};

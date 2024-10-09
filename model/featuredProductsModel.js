// models/flashSalesModel.js
module.exports = (sequelize, DataTypes) => {
    const FeaturedProduct = sequelize.define("featured_products", {
        product_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image_url: {  // Add this field
            type: DataTypes.STRING,
            allowNull: false,
        },
    });
    return FeaturedProduct;
};

"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  //Insert msg's for book and author ***
  Book.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Title Can't be empty",
          },
          notEmpty: {
            msg: "Title can't be empty",
          },
        },
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false,

        validate: {
          notNull: {
            msg: "Author can't be empty",
          },
          notEmpty: {
            msg: "Author names can't be empty",
          },
        },
      },
      genre: DataTypes.STRING,
      year: {
        type: DataTypes.INTEGER,
        validate: {
          isNumeric: {
            msg: "Year should be a number",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Book",
    }
  );
  return Book;
};

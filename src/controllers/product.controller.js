import service from "../services/product.service.js";
import factory from "./factory.js";

const usersProductController = {
  getNewProducts: factory.getAll(service.getHotProducts),
  getTopProducts: factory.getAll(service.getTopProducts),
  getByCategories: factory.getAll(service.getProductsByCategories),
};

export default usersProductController;

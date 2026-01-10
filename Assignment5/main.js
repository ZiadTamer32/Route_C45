const express = require("express");
const mysql = require("mysql2");
const app = express();
const PORT = 3000;

// Create the connection to database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "assignment5",
  port: 3306,
  multipleStatements: true,
});

// Catch connection error
connection.connect((err) => {
  if (!err) {
    console.log("Database connected successfully");
  } else {
    console.log("Database connection failed");
  }
});

app.use(express.json());

// Add a column “Category” to the Products table.
app.post("/products/add-category", (req, res) => {
  const addCategoryQuery = `
    ALTER TABLE products
    ADD COLUMN category varchar(200) not null
  `;
  connection.execute(addCategoryQuery, (err, result) => {
    if (err) {
      return res.status(500).json({ errMsg: "Error during add category" });
    }
    return res.status(201).json({ msg: "Created" }, result);
  });
});
// Delete the column “Category” from the Products table
app.delete("/products/delete-category", (req, res) => {
  const removeCategoryQuery = `
    ALTER TABLE products
    DROP COLUMN category
  `;
  connection.execute(removeCategoryQuery, (err, result) => {
    if (err) {
      return res.status(500).json({ errMsg: "Error during delete category" });
    }
    return res.status(200).json({ msg: "Deleted" }, result);
  });
});
// Change “ContactNumber” column in Suppliers to VARCHAR (15).
app.patch("/suppliers/update-contact-number", (req, res) => {
  const updateContactNumberQuery = `
    ALTER TABLE suppliers
    MODIFY conctact_number varchar(15)
  `;
  connection.execute(updateContactNumberQuery, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ errMsg: "Error during update contact number" });
    }
    return res.status(200).json({ msg: "Updated Contact Number" }, result);
  });
});
// Add a NOT NULL constraint to ProductName.
app.patch("/products/update-product-name", (req, res) => {
  const updateProductNameQuery = `
    ALTER TABLE products
    MODIFY product_name varchar(200) not null
  `;
  connection.execute(updateProductNameQuery, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ errMsg: "Error during update product name" });
    }
    return res.status(200).json({ msg: "Updated Product Name" }, result);
  });
});
// Add a supplier with the name 'FreshFoods' and contact number '01001234567'.
app.post("/suppliers/add-supplier", (req, res) => {
  const { supplier_name, conctact_number } = req.body;
  const insertQuery = `
    INSERT INTO suppliers (supplier_name, conctact_number)
    VALUES (?,?)
  `;
  connection.execute(
    insertQuery,
    [supplier_name, conctact_number],
    (err, result) => {
      if (err) {
        return res.status(500).json({ errMsg: "Error during add supplier" });
      }
      return res.status(201).json({ msg: "Values Inserted" }, result);
    }
  );
});
//Insert the following three products, all provided by 'FreshFoods'
app.post("/products/add-product/:supplier_id", (req, res) => {
  const { supplier_id } = req.params;

  const selectQuery = `
    SELECT supplier_id
    FROM suppliers
    WHERE supplier_id = ?
  `;

  connection.execute(selectQuery, [supplier_id], (err, result) => {
    if (err) {
      return res.status(500).json({ errMsg: "Error during select supplier" });
    }
    if (!result.length) {
      return res.status(404).json({ errMsg: "Supplier not found" });
    }
    const { product_name, product_price, product_quantity } = req.body;

    const insertQuery = `
    INSERT INTO products (product_name, product_price, product_quantity, supp_id)
    VALUES (?,?,?,?)
  `;

    connection.execute(
      insertQuery,
      [product_name, product_price, product_quantity, supplier_id],
      (err, result) => {
        if (err) {
          return res.status(500).json({ errMsg: "Error during add product" });
        }
        return res.status(201).json({ msg: "Values Inserted" }, result);
      }
    );
  });
});
// Add a record for the sale of 2 units of 'Milk' made on '2025-05-20'.
app.post("/sales/add-sale/:product_id", (req, res) => {
  const { product_id } = req.params;
  const { quantity_sold, sale_date } = req.body;

  const selectQuery = `
    SELECT product_id, product_quantity
    FROM products
    WHERE product_id = ?
  `;

  connection.execute(selectQuery, [product_id], (err, result) => {
    if (err) {
      return res.status(500).json({ errMsg: "Error during select product" });
    }
    if (!result.length) {
      return res.status(404).json({ errMsg: "Product not found" });
    }
    const currentQuantity = result[0].product_quantity;

    if (quantity_sold > currentQuantity) {
      return res.status(400).json({ errMsg: "Not enough quantity" });
    }

    const insertQuery = `
    INSERT INTO sales (sale_date, quantity_sold, product_id)
    VALUES (?,?,?)
  `;

    connection.execute(
      insertQuery,
      [sale_date, quantity_sold, product_id],
      (err, result) => {
        if (err) {
          return res.status(500).json({ errMsg: "Error during add sale" });
        }

        return res.status(201).json({ msg: "Values Inserted" }, result);
      }
    );
  });
});
// Update the price of 'Bread' to 25.00.
app.patch("/products/update-product-price/:product_id", (req, res) => {
  const { product_id } = req.params;
  const { product_price } = req.body;

  const updateQuery = `
  UPDATE products
  SET product_price = ?
  WHERE product_id = ?
  `;

  connection.execute(
    updateQuery,
    [product_price, product_id],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ errMsg: "Error during update product price" });
      }
      if (!result.affectedRows) {
        return res.status(404).json({ errMsg: "Product not found" });
      }
      return res.status(200).json({ msg: "Updated Product Price" }, result);
    }
  );
});
// Delete the product 'Eggs'.
app.delete("/products/delete-product/:product_id", (req, res) => {
  const { product_id } = req.params;
  const deleteQuery = `
  DELETE FROM products
  WHERE product_id = ?
  `;
  connection.execute(deleteQuery, [product_id], (err, result) => {
    if (err) {
      return res.status(500).json({ errMsg: "Error during delete product" });
    }
    if (!result.affectedRows) {
      return res.status(404).json({ errMsg: "Product not found" });
    }
    return res.status(200).json({ msg: "Deleted" }, result);
  });
});
// Retrieve the total quantity sold for each product.
app.get("/sales/total-quantity-sold", (req, res) => {
  const query = `
  SELECT p.product_id, p.product_name ,SUM(quantity_sold) as total_quantity_sold 
  FROM sales as s
  LEFT JOIN products as p
  ON s.product_id = p.product_id
  GROUP BY product_id
  `;
  connection.execute(query, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ errMsg: "Error during total quantity sold", err });
    }
    if (!result.length) {
      return res.status(404).json({ errMsg: "Product not found" });
    }
    return res.status(200).json({ msg: "Total Quantity Sold", result });
  });
});
// Get the product with the highest stock.
app.get("/products/highest-stock", (req, res) => {
  const query = `
  SELECT product_name, product_quantity as highest
  FROM products
  ORDER BY highest DESC
  LIMIT 1
  `;
  connection.execute(query, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ errMsg: "Error during highest stock", err });
    }
    return res.status(200).json({ msg: "Highest Stock", result });
  });
});
// Find suppliers with names starting with 'F'.
app.get("/suppliers/find-suppliers", (req, res) => {
  const query = `
  SELECT supplier_name
  FROM suppliers
  WHERE supplier_name like ?
  `;
  connection.execute(query, ["F%"], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ errMsg: "Error during find suppliers", err });
    }
    if (!result.length) {
      return res.status(404).json({ errMsg: "No Supplier Found" });
    }
    return res.status(200).json({ msg: "Find Suppliers", result });
  });
});
// Show all products that have never been sold.
app.get("/products/never-sold", (req, res) => {
  const query = `
  SELECT product_name
  FROM products as p
  LEFT JOIN sales  as s
  ON p.product_id = s.product_id
  WHERE s.product_id IS NULL
  `;
  connection.execute(query, (err, result) => {
    if (err) {
      return res.status(500).json({ errMsg: "Error during never sold", err });
    }
    if (!result.length) {
      return res.status(200).json({ errMsg: "No Product Never Sold" });
    }
    return res.status(200).json({ msg: "Never Sold", result });
  });
});
// Get all sales along with product name and sale date
app.get("/sales/all-sales", (req, res) => {
  const query = `
  SELECT s.sale_date, p.product_name 
  FROM sales as s
  LEFT JOIN products as p
  ON s.product_id = p.product_id
  `;
  connection.execute(query, (err, result) => {
    if (err) {
      return res.status(500).json({ errMsg: "Error during all sales", err });
    }
    if (!result.length) {
      return res.status(200).json({ errMsg: "No Product Never Sold" });
    }
    return res.status(200).json({ msg: "All Sales", result });
  });
});
// Create a user “store_manager” and give them SELECT, INSERT, and UPDATE permissions on all tables.
app.post("/users/add-user", (req, res) => {
  const { username, password } = req.body;
  // Use proper semicolons and quotes
  const addUserQuery = `
    CREATE USER '${username}'@'localhost' IDENTIFIED BY '${password}';
    GRANT SELECT, INSERT, UPDATE ON assignment5.* TO '${username}'@'localhost';
    FLUSH PRIVILEGES;
  `;

  connection.query(addUserQuery, (err, result) => {
    if (err) {
      return res.status(500).json({ errMsg: "Error during add user" });
    }
    return res.status(200).json({ msg: "User Added", result });
  });
});
// Revoke UPDATE permission from “store_manager”
app.post("/users/revoke-user", (req, res) => {
  const { username } = req.body;
  const query = `
    REVOKE UPDATE ON assignment5.* FROM '${username}'@'localhost';
  `;

  connection.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ errMsg: "Error during revoke update" });
    }
    return res.status(200).json({ msg: "User Revoked", result });
  });
});
// Grant DELETE permission to “store_manager” only on the Sales table.
app.post("/users/grant-user", (req, res) => {
  const { username } = req.body;
  const query = `
  GRANT DELETE ON assignment5.sales TO '${username}'@'localhost';
  `;
  connection.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ errMsg: "Error during grant user" });
    }
    return res.status(200).json({ msg: "User Granted", result });
  });
});
app.listen(PORT, () => {
  console.log(`Server is running :: ${PORT}`);
});
